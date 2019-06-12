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


const pubKey =
    "----- BEGIN PUBLIC KEY-----/n"+
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv\n" +
    "vkTtwlvBsaJq7S5wA + kzeVOVpVWwkWdVha4s38XM / pa / yr47av7 + z3VTmvDRyAHc\n" +
    "aT92whREFpLv9cj5lTeJSibyr / Mrm / YtjCZVWgaOYIhwrXwKLqPr / 11inWsAkfIy\n" +
    "tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0\n" +
    "e + lf4s4OxQawWD79J9 / 5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb\n" +
    "V6L11BWkpzGXSW4Hv43qa + GSYOD2QU68Mb59oSk2OB + BtOLpJofmbGEGgvmwyCI9\n" +
    "MwIDAQAB\n" +
    "----- END PUBLIC KEY-----";

class ReceiveMessages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: null,
            receiving: false,
            multiboxData: null,
            receivedMessages: []
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

            //console.log(msg.data);
            msg.decodedToken = await this.props.consentGen.decode(msg.data);

            if (msg.decodedToken !== null) {
                let data = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoiMSIsImp1cmlzZGljdGlvbiI6IlNJIiwiY29uc2VudFRpbWVzdGFtcCI6MTEyMjMxMjMxMiwiY29sbGVjdGlvbk1ldGhvZCI6Ik1ldGhvZCIsImNvbnNlbnRSZWNlaXB0SUQiOiIxMjMxNDEyMzEyMzEyMzEyMyIsInB1YmxpY0tleSI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW56eWlzMVpqZk5CMGJCZ0tGTVN2XG52a1R0d2x2QnNhSnE3UzV3QStremVWT1ZwVld3a1dkVmhhNHMzOFhNL3BhL3lyNDdhdjcrejNWVG12RFJ5QUhjXG5hVDkyd2hSRUZwTHY5Y2o1bFRlSlNpYnlyL01ybS9ZdGpDWlZXZ2FPWUlod3JYd0tMcVByLzExaW5Xc0FrZkl5XG50dkhXVHhaWUVjWExnQVhGdVV1YVMzdUY5Z0VpTlF3ekdUVTF2MEZxa3FUQnI0QjhuVzNIQ040N1hVdTB0OFkwXG5lK2xmNHM0T3hRYXdXRDc5SjkvNWQzUnkwdmJWM0FtMUZ0R0ppSnZPd1JzSWZWQ2hEcFlTdFRjSFRDTXF0dldiXG5WNkwxMUJXa3B6R1hTVzRIdjQzcWErR1NZT0QyUVU2OE1iNTlvU2syT0IrQnRPTHBKb2ZtYkdFR2d2bXd5Q0k5XG5Nd0lEQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tIiwibGFuZ3VhZ2UiOiJTSSIsInBpaVByaW5jaXBhbElkIjoiMzEyMyIsInBpaUNvbnRyb2xsZXJzIjpbeyJwaWlDb250cm9sbGVyIjoiVGV4IiwiY29udGFjdCI6InRleCBhdCBmZHMiLCJhZGRyZXNzIjp7fSwiZW1haWwiOiJ0ZXhAZmRzLm9yZyIsInBob25lIjoiMTIzNTQxMjMiLCJwaWlDb250cm9sbGVyVXJsIjoid3d3LmZkcy5vcmcifV0sInNlcnZpY2VzIjpbeyJzZXJ2aWNlIjoiMzEyMyIsInB1cnBvc2VzIjpbeyJwdXJwb3NlIjoiMTIzIiwiY29uc2VudFR5cGUiOiJjb25zZW50IHR5cGUiLCJwdXJwb3NlQ2F0ZWdvcnkiOlsiMTIzMTIiXX1dfV0sImlhdCI6MTU2MDM0NzMwMCwiZXhwIjoxNTYwMzkwNTAwLCJhdWQiOiJhdWRpZW5jZSIsImlzcyI6Imlzc3VlciIsInN1YiI6InN1YmplY3QifQ.AEeJgfPbHWS8ouAZrOPb_DLe7cSyO59hfVIHLicpemn - 5oe7FTM25QhS0FSyKbZXdcYs - prjA6rjwjTatSHWx3xI3wRvH_txMwT2QjZRqSBvVgbaodfkinoIBpHglMezfTTc6dj0ng_ndTFt4N2KL26CqZ_XI - LVfHF5R8h - I8MK5uLzUI6ucGz8EhGTGvKDF_ - jMriWW5ESDMDLkNGNtfa9hdy1tNlR1Ndgs7ZwwOfeFnVbafqBZSUfzYFXuU8MPbOl9oT8dSBIBXO3fNXGuIP291g3X3EMxagveWeMeeNAT8G_o6VLntxG91mwaL5sFO5vwrC2mRetgi99wYmgkw";
                let test = await this.props.consentGen.verify(pubKey, data);    
                let opk = msg.decodedToken.payload.publicKey.replace("/n", "\n");
                console.log("token verify" + test, pubKey, data, opk, msg.data);

                console.log(msg.decodedToken.payload.publicKey === pubKey, data === msg.data);
                msg.verified = await this.props.consentGen.verify(/*msg.decodedToken.payload.publicKey*/ opk, msg.data);
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
                    let content = Helpers.ExtractMessage(reader.result);
                    context.addReceived({ id: id, isHidden: false, message: message, data: reader.result, isConsentRecepit: isCRJWT, decodedToken: null, verified:false });

                    //console.log("reading", message);
                }
                await reader.readAsText(await this.state.account.receive(message));
            }
        });
        await this.setState({ receiving: false });
    }

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
        return <div className="receivedMessagesWindow">
            Received: <strong>{this.state.receivedMessages.length} </strong>
            {receivedItems.map(m =>
                <small key={m.id}>
                    <Message message={m} />
                </small>)}
        </div>
    }
}

export default ReceiveMessages;