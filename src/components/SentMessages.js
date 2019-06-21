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

class SentMessages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: null,
            sentMessages: [],
            visible: false
        }
    }
    componentDidMount() {
        this.setAccount(this.props.account);
        this.interval = setInterval(() => this.getSentMessages(this), 2000);
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
    async addSent(msg) {
        try {
            msg.decodedToken = await this.props.consentGen.decode(msg.data); //, { complete: true });

            if (msg.decodedToken !== null) {
                msg.verified = await this.props.consentGen.verify(msg.decodedToken.payload.publicKey, msg.data);
            }
        } catch (err) { console.error(err); }

        this.setState({ sentMessages: [msg, ...this.state.sentMessages] });
        //console.log("add sent", msg);
        this.forceUpdate();
    }
    async findSent(msgId) {
        return this.state.sentMessages.find(msg => msg.id === msgId);
    }


    async getSentMessages(context) {
        if (this.state.receiving) return;
        if (this.state.account === null) return;

        await this.setState({ receiving: true });
        let messages = await this.state.account.messages('sent', window.FDS.applicationDomain);
        var reader = new FileReader();
        
        await Helpers.asyncForEach(messages, async (message) => {
            var file = await message.getFile(); // what if this fails? 
            var isCRJWT = Helpers.IsConsentRecepit(file.name);
            var id = Helpers.hashFnv32a(message.hash.address);

            if (!await this.findSent(id)) {
                //console.log(message);

                reader.onload = function (e) {
                    //let content = Helpers.ExtractMessage(reader.result);
                    context.addSent({ id: id, isHidden: false, message: message, data: reader.result, isConsentRecepit: isCRJWT, decodedToken: null, verified: false });
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
        if (this.state.sentMessages === null) return <div > no messages </div>;
        //if (this.state.sentMessages.length === 0) return <div > no messages sent </div>;

        let q = this.props.query;
        let sentItems = this.state.sentMessages;
        if (q.length > 0) { // filter results
            sentItems = sentItems.filter(m => {
                if (m.isHidden) return false;
                //if (m.sender.search(q) !== -1) return true;
                if (m.contents.search(q) !== -1) return true;
                return false;
            });
        }

        let toggle = <div onClick={() => this.toggleVisible()}> Sent: <strong>{this.state.sentMessages.length} </strong></div>

        if (!this.state.visible) return <div>{toggle}</div>; 

        return <div className="sentMessagesWindow">
            {toggle}
            {sentItems.map(m =>
                <small key={m.id}>
                    { <Message message={m} /> }
                </small>)}
        </div>
    }
}

export default SentMessages;