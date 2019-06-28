// fairdata.js library uses fds.js library to send consent receipt files over Swarm to another account
// 
// 1. create account 1 
// 2. unlock account 
// 3. load project file 
// 4. load private key 
// 5. generate cr.jwt token
// 6. send cr.jwt token to yourself and wait for delivery 
// 7. get all received files
// 8. for each received file check if its cr.jwt token 
// 9. decode token 
// 10. if decoded then verify token display info 
// 11. repeat from step 5. 
// 

import jwt from "jsonwebtoken";

class Fairdata {
    constructor() {
        this.options = {};
        this.account = null;
        this.privateKey = null;
        this.project = null;
        this.receiving = false;
        this.receivedMessages = [];
        this.multiboxData = [];
    }


    async createAccount(accountName, password, errorCallback = console.log, callback = console.log) {
        try {
            let createdAccount = await window.FDS.CreateAccount(accountName.toLowerCase(), password, callback);
            return createdAccount;
        } catch (err) {
            if (errorCallback) errorCallback(err);
        }
        return null;
    }

    async unlockAccount(subdomain, password) {
        this.account = await window.FDS.UnlockAccount(subdomain.toLowerCase(), password);
        await this.checkDomain(window.FDS.applicationDomain);
        return this.account;
    }


    //////////////////////////////////////////////////////////////////////////////////////
    // check proper domain exists for account
    async checkDomain(applicationDomain, callback=console.log) {
        this.account.setApplicationDomain(applicationDomain);

        await this.getMultiboxData();
        let multiboxAddress = this.multiboxData.id;
        let kvtId = 0;

        let applicationNodeExists = await this.account.Mail.Multibox.createPath(this.account, applicationDomain, multiboxAddress, kvtId);
        //console.log(applicationNodeExists + " " + applicationDomain);
        if (applicationNodeExists > 0) {
            if (callback) callback("Application domain created");
            await this.getMultiboxData();
        }

        if (callback) callback("Application node", applicationNodeExists);

        return applicationNodeExists;
    }
    /** retrieve multibox data 
     * */
    async getMultiboxData() {
        this.multiboxData = await this.account.Mail.Multibox.traverseMultibox(this.account, this.account.subdomain);
        console.log(this.multiboxData);
        return this.multiboxData;
    }

    // import account 
    async loadProject(project, errorCallback = console.log, callback=console.log) {
        if (project.hasOwnProperty('formData') && project.hasOwnProperty('defaultProperties')) {
            if (project.defaultProperties.hasOwnProperty('tokenSigningOptions')) {
                let options = project.defaultProperties.tokenSigningOptions;
                if (options.hasOwnProperty('issuer') && options.hasOwnProperty('subject') &&
                    options.hasOwnProperty('audience') && options.hasOwnProperty('expiresIn') &&
                    options.hasOwnProperty('algorithm')) {

                    this.project = project;
                    if (callback) callback("project looks valid");
                    return true;
                } else {
                    if (errorCallback) errorCallback("no valid options, requires issuer, subject, audience, expiresIn, algorithm");
                }
            } else {
                if (errorCallback) errorCallback("no valid defaultProperties, requires tokenSigningOptions");
            }
        } else {
            if (errorCallback) errorCallback("no valid formData, defaultProperties");
        }

        if (errorCallback) errorCallback("not a valid consent project");
        return false;
    }
    async loadPrivateKey(privateKey) {
        this.privateKey = privateKey;
        return this.privateKey;
    }
    async generateToken(errorCallback = console.log, callback=console.log) {
        if (this.account === null || this.privateKey === null || this.project === null) {
            if (errorCallback) errorCallback("invalid setup");
        }
        if (callback) callback("generating token from project");
        return await this.generate(this.project.formData, this.privateKey, this.project.defaultProperties.tokenSigningOptions);
    }
    async sendToken(token, toAccountSubdomain, errorCallback = console.log, callback = console.log) {
        if (callback) callback(`${this.account.subdomain} sending to ${toAccountSubdomain}`);
        let r = Math.floor(Date.now());
        let file = new File([`${token}`], `${r}.cr.jwt`, { type: 'application/jwt' });

        try {
            let result = await this.account.send(toAccountSubdomain, file, window.FDS.applicationDomain, callback, callback, callback);
            if(callback) callback(`${this.account.subdomain} sent ${result} >>>> ${toAccountSubdomain}`);
            return result;
        } catch (err) {
            if (errorCallback) errorCallback(err);
            try {
                if (err.search("pubKey") !== -1)
                    if (errorCallback) errorCallback("Probably recepient does not exits");
            } catch (err2) {
                if (errorCallback) errorCallback(err2);
            }
        }
    }
    async getReceivedMessages(downloadCallback=null, decryptionCallback=null, errorCallback=null, callback=null) {
        
        if (this.account === null) {
            if (errorCallback) errorCallback("no account");
            return null;
        }
        if (this.receiving === true) {
            if (errorCallback) errorCallback("already receiving");
            return this.receivedMessages;
        }

        this.receiving = true;

        let messages = await this.account.messages('received', window.FDS.applicationDomain);
        var reader = new FileReader();

        
        await this.asyncForEach(messages, async (message) => {
            var file = await message.getFile(); // what if this fails? 
            var isCRJWT = await this.IsConsentRecepit(file.name);
            var id = await this.hashFnv32a(message.hash.address);

            // was not yet added
            if (!await this.findReceived(id)) {
                let context = this; 
                reader.onload = function (e) {
                    //let content = ExtractMessage(reader.result); 
                    context.addReceivedMessage({ id: id, message: message, data: reader.result, isConsentRecepit: isCRJWT, decodedToken: null, verified: false }, errorCallback, callback);
                    if(callback) callback(id, message);
                }
                await reader.readAsText(await this.account.receive(message, decryptionCallback, downloadCallback));
            }
        });
        if (this.receiving === false) return;
        return this.receivedMessages;
    }


    async decodeTokenFrom(receivedMessage, errorCallback=null, callback=null) {
        try {
            receivedMessage.decodedToken = await this.decode(receivedMessage.data); 
            if (receivedMessage.decodedToken !== null) {
                receivedMessage.verified = await this.verify(receivedMessage.decodedToken.payload.publicKey, receivedMessage.data);
                if (callback) callback(receivedMessage, receivedMessage.verified, receivedMessage.decodedToken);
            }
        } catch (err) { if (errorCallback) errorCallback(err); }
    }

    async addReceivedMessage(receivedMessage, errorCallback = null, callback = null) {
        try {
            await this.decodeTokenFrom(receivedMessage, errorCallback, callback);
            this.receivedMessages.push(receivedMessage);
            //if (callback) callback("added", receivedMessage);
        } catch (err) { if (errorCallback) errorCallback(err); }
    }


    //////////////////////////////////////////////////////////////////////////////////////
    // These functions are required to generate, verify, decode jwt token
    /** generate jwt token with algo specified in options
    */
    generate(formData, privateKey, options) {
        return jwt.sign(formData, privateKey, options);
    }
    /** verify jwt token with RS256 algo
     */
    verify(publicKey, jwtToken, options = this.options, callback=null) {
        //console.log("publicKey ", publicKey);
        try {
            let legit = jwt.verify(jwtToken, publicKey, options);
            if(callback) callback("Signature VALID!", legit);
            return legit;
        } catch (e) {
            if (callback) callback("Invalid signature!", jwtToken, publicKey, options);
        }
        return false;
    }
    /** decodes jwt token
     */
    decode(jwtToken) {
        return jwt.decode(jwtToken, { complete: true });
    }
    /** generates JWT token with data from project
     */
    generateFrom(project, privateKey, errorCallback=console.log) {
        try {
            return this.generate(project.formData, privateKey, project.defaultProperties.tokenSigningOptions);
        } catch (err) { if (errorCallback) errorCallback(err); }

        return null;
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // Helper functions 
    async hashFnv32a(str) {
        var i, l, hval = 0x811c9dc5;

        for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        return hval >>> 0;
    }
    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
    async IsConsentRecepit(data, callback = console.log) {
        try {
            var match = data.match(/(.*).cr.jwt/);
            if (match.length === 2) {
                return true;
            } else {
                //callback("not an Consent receipt");
            }
        } catch (err) {
            callback(err);
        }
        return false;
    }
    async findReceived(msgId) {
        return this.receivedMessages.find(msg => msg.id === msgId);
    }


}

export default Fairdata;