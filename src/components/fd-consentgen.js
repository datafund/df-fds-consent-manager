import jwt from "jsonwebtoken";
/*
let options = {
    issuer: 'issuer',
    subject: 'subject',
    audience: 'audience',
    expiresIn: "12h",
    algorithm: "RS256"
};*/

class ConsentGen {
    constructor(consentIssuer, consentSubject, intendedAudience, expirationIn, algo) {
        this.options = {
            issuer: consentIssuer,
            subject: consentSubject,
            audience: intendedAudience,
            expiresIn: expirationIn,
            algorithm: algo
        };
    }
    setOptions(newOptions) {
        this.options = newOptions;
    }

    // generate jwt token with RS256 algo
    generate(formData, privateKey, options) {
        return jwt.sign(formData, privateKey, options);
    }

    // verify jwt token with RS256 algo
    verify(publicKey, jwtToken, options = this.options) {
        //console.log("publicKey ", publicKey);

        try {
            let legit = jwt.verify(jwtToken, publicKey, options); 
            //console.log("Signature VALID!", legit);
            return true;
        } catch (e) {
            //console.log("Invalid signature!", jwtToken, publicKey, options);
        }
        return false;
    }
    // decodes jwt token
    decode(jwtToken) {
        return jwt.decode(jwtToken, { complete: true });
    }
}

export default ConsentGen;