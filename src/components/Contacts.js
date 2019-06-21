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
//import * as Helpers from './Helpers.js';

class Contacts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: null,
            contacts: []
        }
    }
    componentDidMount() {
        this.setAccount(this.props.account);
        this.interval = setInterval(() => this.getContacts(), 5000);
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
        await this.getContacts();
    }
    async getContacts() {
        let contacts = await this.state.account.getContacts();
        contacts.forEach((newContact) => {
            this.findContactOrAdd(newContact.subdomain);
        });
        
    }
    async addContact(name) {
        var new_contacts = Object.assign({}, this.state.contacts);  // must copy 
        new_contacts[name] = { numReceived: 0, known: true, visible: true }; // add to array  
        await this.setState({ contacts: new_contacts });
        this.forceUpdate();
    }

    async findContactOrAdd(name) {
        if (!(name in this.state.contacts))
            await this.addContact(name);
    }
    async removeContact(name) {
        var cntcts = { ...this.state.contacts };
        delete cntcts[name];
        this.setState({ contacts: cntcts });
    }

    async  setContactVisibility(name, visibility) {
        var cntcts = { ...this.state.contacts };
        if (cntcts[name] !== undefined)
            cntcts[name].visible = visibility;

        this.setState({ contacts: cntcts });
    }  
    async selectContact(e) {
        this.props.app.setRecepient(e.key.toString());
    }

    render() {
        if (this.props.account === null) return <div > wait  </div>;
        if (this.state.account === null) return <div > wating for account  </div>;
        //if (this.state.contacts.length === 0) return <div > no contacts </div>;

        /*
        let q = this.props.query;
        let contactItems = this.state.contacts;
        if (q.length > 0) { // filter results
            contactItems = contactItems.filter(m => {
                if (m.contents.search(q) !== -1) return true;
                return false;
            });
        } */

        const contacts = this.state.contacts; 

        return <div className="contactsWindow">
            Contacts: <strong>{contacts.length}</strong><br />

            {Object.entries(contacts).map(([key, index]) => (
                contacts[key].visible ?
                    <div className="contactItem">
                       <small key={key} onClick={() => this.selectContact({ key })} className="contactsItem">
                          {key}
                          <small className="contactsCount"> {contacts[key].numReceived}</small>
                        </small>
                    </div>
                    : null
    
                ))
                }
        </div>
    }
}

export default Contacts;