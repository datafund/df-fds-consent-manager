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

class AccountLogin extends React.Component {
    constructor(props) {
        super(props);
        this.handleText = this.handleText.bind(this);
        this.handleError = this.handleError.bind(this);

        this.state = {
            account: null,
            textInfo: "no account",
            errorInfo: "",
            accountName: "",
            accountPass: ""
        }

        this.unlockAccount("tttttttt123123123123", "test");
    }
    async createAccount(accountName, password) {
        if (accountName.length < 3) {
            this.handleError("account name too short.");
            return;
        }
        if (password.length < 3) {
            this.handleError("password too short.");
            return;
        }
        this.handleText("creating account");
        try {
            let account = await window.FDS.CreateAccount(accountName.toLowerCase(), password, this.handleText);
            this.props.app.setAccount(account);
        } catch (err) {
            console.error(err);
            this.handleError(err);
        }
    }
    async walletOpened(e) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            this.restoreAccount(reader.result, filename, this.state.accountPass);
        });
        let filename = e.target.files[0].name;
        reader.readAsText(e.target.files[0]);
    }
    async restoreAccount(json, filename, password) {
        let file = new File([json], filename, { type: 'text/plain' });
        var subdomain = null;
        try {
            await window.FDS.RestoreAccount(file);
        }
        catch (err) {
            this.handleText(err);
            try {
                var match = file.name.match(/fds-wallet-(.*)-backup/);
                if (match.length === 2) {
                    subdomain = match[1];
                    this.unlockAccount(subdomain, password);
                }
            } catch (err2) {
                console.error(err2);
                this.handleError("can't unlock, bad pass?");
            }
        }

        let accounts = await window.FDS.GetAccounts();
        console.log(`accounts in local storage: ${accounts.length} `);
    }
    async unlockAccount(subdomain, password) {
        try {
            let account = await window.FDS.UnlockAccount(subdomain.toLowerCase(), password);
            this.props.app.setAccount(account);
        } catch (error) {
            this.handleError(error);
            console.error(error);
        }
    }

    handleText(t) { this.setState({ textInfo: t }); }
    handleError(t) { this.setState({ errorInfo: t }); }
    handleAccountName(e) { this.setState({ accountName: e.target.value }); }
    handleAccountPass(e) { this.setState({ accountPass: e.target.value }); }

    processOpenWalletFile(e)    { this.refs.fileUploader.click(); }


    render() {
        let createButton = <button onClick={() => this.createAccount(this.state.accountName, this.state.accountPass)}> Create </button>;
        let importButton = <button onClick={() => this.processOpenWalletFile()}> Import </button>;
        let unlockButton = <button onClick={() => this.unlockAccount(this.state.accountName, this.state.accountPass)}> Unlock </button>;

        let enterAccountName = <input placeholder="name account" value={this.state.accountName} onChange={(e) => this.handleAccountName(e)} className="messageReceiverBox" />;
        let enterAccountPass = <input placeholder="password" type="password" value={this.state.accountPass} onChange={(e) => this.handleAccountPass(e)} className="messageReceiverBox" />;
        let login = <div className="createImport">{enterAccountName}<br />{enterAccountPass}<br />{unlockButton}<br />{createButton}<br />{importButton}</div>;

        return <div className="loginWindow">
                    <input type="file" id="file" ref="fileUploader" onChange={(e) => this.walletOpened(e)} style={{ display: "none" }} />

                    {this.state.textInfo}<br />
                    {this.state.errorInfo}<br />
                    Create, Unlock or Import account<br />
                    {login}
        </div>
    }
}

export default AccountLogin;