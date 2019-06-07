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
import QRCode from 'qrcode.react';

class AccountSettings extends React.Component {
    saveAccount() {
        this.props.account.saveBackupAs();
    }

    render() {
        if (this.props.account === null) return <div />;

        return <div className="settingsWindow">
          Account Name:
          <strong>{this.props.account.subdomain} </strong>
          <br />  Balance: 
          <strong>{this.props.app.state.balance} D3X</strong><br />
          <br />  Address:
          <strong>{this.props.account.address} </strong><br />
            <QRCode value={this.props.account.address} />
            <br />
            <button onClick={() => this.saveAccount()}>Save wallet</button>
            <br />
            <button onClick={() => this.props.app.toggleAccountSettings()}>Close</button>
        </div>
    }
}

export default AccountSettings;