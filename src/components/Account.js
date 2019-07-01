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

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            account: null,
            multiboxData: null,
            mbnonce: 0,
            balance: ""
        }
    }
    componentDidMount() {
        this.setAccount(this.props.account);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var mustUpdate = (nextProps.account !== this.state.account);
        //console.log(mustUpdate);

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

        await this.updateMultibox(acc);
        await this.checkApllicationDomain(acc);
        await this.getBalance(acc);

        //console.log(acc);
    }
    async setMultiboxData(mbd) {
        this.setState({ multiboxData: mbd });
        this.setState({ mbnonce: this.state.mbnonce + 1 });
    }
    async setBalance(b) {
        //console.log(this.state.balance);
        this.setState({ balance: "" + b.substr(0, b.length - 5) });
        this.props.app.setBalance(b);
        this.forceUpdate();
    }
    async updateMultibox(account) {
        var multiboxData = await account.Mail.Multibox.traverseMultibox(account, account.subdomain);
        this.setMultiboxData(multiboxData);

        //console.log(multiboxData);
    }
    async checkApllicationDomain(account) {
        //let applicationNodeExists = await account.Mail.Multibox.createPath(account, this.props.applicationDomain, this.state.multiboxData.id);

        let applicationNodeExists = await account.Mail.Multibox.createPath(account, this.props.applicationDomain, this.state.multiboxData.id);
        if (applicationNodeExists > 0) {
            await this.updateMultibox(account);
        }
    }
    async getBalance(account) {
        let b = await account.getBalance();
        this.setBalance(account.Tx.web3.utils.fromWei(b, 'ether'));
    }

    render() {
        if (this.props.account === null) return <div > wait  </div>;

        if (this.state.account === null) return <div > No account  </div>;

        return <div className="accountWindow">
            <strong className="settings" onClick={() => this.props.app.toggleAccountSettings()}> ⚙ </strong>
            Account: <strong>{this.state.account.subdomain} </strong>
            Balance: <strong>{this.state.balance} D3X</strong>
            
        </div>
    }
}

export default Account;