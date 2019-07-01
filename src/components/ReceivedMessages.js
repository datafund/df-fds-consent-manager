// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

import React from 'react';
import Message from './Messages';
import * as Helpers from './Helpers.js';

/*

const public_key  =
    "----- BEGIN PUBLIC KEY-----\n"+
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv\n" +
    "vkTtwlvBsaJq7S5wA + kzeVOVpVWwkWdVha4s38XM / pa / yr47av7 + z3VTmvDRyAHc\n" +
    "aT92whREFpLv9cj5lTeJSibyr / Mrm / YtjCZVWgaOYIhwrXwKLqPr / 11inWsAkfIy\n" +
    "tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0\n" +
    "e + lf4s4OxQawWD79J9 / 5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb\n" +
    "V6L11BWkpzGXSW4Hv43qa + GSYOD2QU68Mb59oSk2OB + BtOLpJofmbGEGgvmwyCI9\n" +
    "MwIDAQAB\n" +
    "----- END PUBLIC KEY-----";

let pubKey= '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv\n' +
    'vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc\n' +
    'aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy\n' +
    'tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0\n' +
    'e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb\n' +
    'V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9\n' +
    'MwIDAQAB\n' +
    '-----END PUBLIC KEY-----';
    */

class ReceiveMessages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: null,
            receiving: false,
            multiboxData: null,
            receivedMessages: [],
            visible: true
        }
    }
    componentDidMount() {
        this.setAccount(this.props.account);
        this.interval = setInterval(() => this.getReceivedMessages(this), 2000);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var mustUpdate = (nextProps.account !== this.state.account);

        if (this.state.account === null) {
            if (mustUpdate || this.props.account !== undefined) {
                this.setAccount(this.props.account); 
                this.forceUpdate();
            }
        }
        return mustUpdate;
    }

    async setAccount(acc) {
        await this.setState({ account: acc }); 
        //await this.updateMultibox(acc);
    }
    async addReceived(msg) {
        try {
            msg.decodedToken = await this.props.dataReceiptLib.decode(msg.data); //, { complete: true });

            if (msg.decodedToken !== null) {
                msg.verified = await this.props.dataReceiptLib.verify(msg.decodedToken.payload.publicKey, msg.data);
            }

            //console.log(msg);
        } catch (err) { console.error(err); }
        
        await this.setState({ receivedMessages: [msg, ...this.state.receivedMessages] }); 
        //console.log("add received", msg, this.state.receivedMessages, this);
        this.forceUpdate();
    }
    async findReceived(msgId) {
        return this.state.receivedMessages.find(msg => msg.id === msgId);
    } 
    
    async getReceivedMessages(context) {
        if (this.state.receiving) return; 
        if (this.state.account===null) return; 

        await this.setState({ receiving: true });
        let messages = await this.state.account.messages('received', window.FDS.applicationDomain);
        var reader = new FileReader();
        
        await Helpers.asyncForEach(messages, async (message) => {
            var file = await message.getFile(); // what if this fails? 
            var isCRJWT = Helpers.IsConsentRecepit(file.name);
            var id = Helpers.hashFnv32a(message.hash.address);

            if (!await this.findReceived(id)) {
                reader.onload = function (e) {
                    //let content = Helpers.ExtractMessage(reader.result);
                    context.addReceived({ id: id, isHidden: false, message: message, data: reader.result, isConsentRecepit: isCRJWT, decodedToken: null, verified:false });
                    //console.log("reading", message);
                }
                await reader.readAsText(await this.state.account.receive(message));
            }
        });
        await this.setState({ receiving: false });
    }

    async toggleVisible() { await this.setState({ visible: !this.state.visible }); this.forceUpdate(); }

    render() {
        if (this.props.account === null) return <div > wait  </div>;
        if (this.state.account === null) return <div > wating for account  </div>;
        if (this.state.receivedMessages === null) return <div > no messages </div>;
        //if (this.state.receivedMessages.length === 0 ) return <div > no messages received </div>;
        
        let q = this.props.query;
        let receivedItems = this.state.receivedMessages;
        if (q.length > 0) { // filter results
            receivedItems = receivedItems.filter(m => {
                if (m.isHidden) return false;
                //if (m.sender.search(q) !== -1) return true;
                //if (m.data.search(q) !== -1) return true;
                return false;
            });
        }

        let toggle = <div onClick={() => this.toggleVisible()}> Received: <strong>{this.state.receivedMessages.length} </strong></div>

        if (!this.state.visible) return <div>{toggle}</div>; 

        return <div className="receivedMessagesWindow">
            {toggle}
            {receivedItems.map(m =>
                <small key={m.id}>
                    <Message message={m} />
                </small>)}
        </div>
    }
}

export default ReceiveMessages;