import React, { Component } from 'react';
import './App.css';
import FDS from 'fds';

import Account from './components/Account';
import AccountLogin from './components/AccountLogin';
import AccountSettings from './components/AccountSettings.js';
import ReceivedMessages from './components/ReceivedMessages.js';
import SentMessages from './components/SentMessages.js';
import Contacts from './components/Contacts.js';

import ConsentGen from './components/fd-consentgen.js';

window.FDS = new FDS({
    swarmGateway: 'https://swarm.fairdatasociety.org',
    ethGateway: 'https://geth-noordung-2.fairdatasociety.org',
    faucetAddress: 'https://dfaucet-testnet-prod.herokuapp.com/gimmie',
    httpTimeout: 1000,
    gasPrice: 0.1,
    ensConfig: {
        domain: 'datafund.eth',
        registryAddress: '0xc11f4427a0261e5ca508c982e747851e29c48e83',
        fifsRegistrarContractAddress: '0x01591702cb0c1d03b15355b2fab5e6483b6db9a7',
        resolverContractAddress: '0xf70816e998819443d5506f129ef1fa9f9c6ff5a7'
    },
    // multibox extension
    applicationDomain: "/shared/consents/"
}); 



class App extends Component {

  constructor(props) {
    super(props);
      this.state = {
          account: null,
          accountSettingsVisible: false,
          balance: "...",
          completed: "",
          output: "",
          results: "",

          consentGen: new ConsentGen('issuer', 'subject', 'audience', "12h", "RS256"),
          accountRef: React.createRef()
      }
    }

    toggleAccountSettings() { this.setState({ accountSettingsVisible: !this.state.accountSettingsVisible }); }

    async sendContents(fromAccount, toAccountSubdomain, data, output, results) {
        output(`${fromAccount.subdomain} sending to ${toAccountSubdomain}`);
        let r = Math.floor(Date.now());
        let file = new File([`${data}`], `${r}.cr.jwt`, { type: 'application/jwt' });

        try {
            let result = await fromAccount.send(toAccountSubdomain, file, window.FDS.applicationDomain, output, output, output);
            output(`${fromAccount.subdomain} sent ${result} >>>> ${toAccountSubdomain}`);
            return result;
        } catch (err) {
            results(err);
            try {
                if (err.search("pubKey") !== -1)
                    results("Probably recepient does not exits");
            } catch (err2) {
                results(err2);
            }
        }
    }


    async setAccount(acc) {
        this.setState({ account: acc });
        acc.setApplicationDomain(window.FDS.applicationDomain);
    }
    async setBalance(b) {
        this.setState({ balance: "" + b.substr(0, b.length - 1) });
    }
    setOutput(output) {
        this.setState({ output: this.state.output + '\n' + output });
    }
    setResults(results, context) {
        this.setState({ completed: this.state.completed + 1, results: this.state.results + '\n' + results });
    }  
    async sendTestToken() {
        //let data = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoiMSIsImp1cmlzZGljdGlvbiI6IlNJIiwiY29uc2VudFRpbWVzdGFtcCI6MTEyMjMxMjMxMiwiY29sbGVjdGlvbk1ldGhvZCI6Ik1ldGhvZCIsImNvbnNlbnRSZWNlaXB0SUQiOiIxMjMxNDEyMzEyMzEyMzEyMyIsInB1YmxpY0tleSI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW56eWFpczFaamZOQjBiQmdLRk1TdlxudmtUdHdsdkJzYUpxN1M1d0Era3plVk9WcFZXd2tXZFZoYTRzMzhYTS9wYS95cjQ3YXY3K3ozVlRtdkRSeUFIY1xuYVQ5MndoUkVGcEx2OWNqNWxUZUpTaWJ5ci9Ncm0vWXRqQ1pWV2dhT1lJaHdyWHdLTHFQci8xMWluV3NBa2ZJeVxudHZIV1R4WllFY1hMZ0FYRnVVdWFTM3VGOWdFaU5Rd3pHVFUxdjBGcWtxVEJyNEI4blczSENONDdYVXUwdDhZMFxuZStsZjRzNE94UWF3V0Q3OUo5LzVkM1J5MHZiVjNBbTFGdEdKaUp2T3dSc0lmVkNoRHBZU3RUY0hUQ01xdHZXYlxuVjZMMTFCV2twekdYU1c0SHY0M3FhK0dTWU9EMlFVNjhNYjU5b1NrMk9CK0J0T0xwSm9mbWJHRUdndm13eUNJOVxuTXdJREFRQUJcbi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLSIsImxhbmd1YWdlIjoiU0kiLCJwaWlQcmluY2lwYWxJZCI6IjMxMjMiLCJwaWlDb250cm9sbGVycyI6W3sicGlpQ29udHJvbGxlciI6IlRleCIsImNvbnRhY3QiOiJ0ZXggYXQgZmRzIiwiYWRkcmVzcyI6e30sImVtYWlsIjoidGV4QGZkcy5vcmciLCJwaG9uZSI6IjEyMzU0MTIzIiwicGlpQ29udHJvbGxlclVybCI6Ind3dy5mZHMub3JnIn1dLCJzZXJ2aWNlcyI6W3sic2VydmljZSI6IjMxMjMiLCJwdXJwb3NlcyI6W3sicHVycG9zZSI6IjEyMyIsImNvbnNlbnRUeXBlIjoiY29uc2VudCB0eXBlIiwicHVycG9zZUNhdGVnb3J5IjpbIjEyMzEyIl19XX1dLCJpYXQiOjE1NjAzMzU5MTYsImV4cCI6MTU2MDM3OTExNiwiYXVkIjoiYXVkaWVuY2UiLCJpc3MiOiJpc3N1ZXIiLCJzdWIiOiJzdWJqZWN0In0.NCgLVXsmwLsRFsauUPNGcpAioeCK848SkYAURpx28HjvjIEOdA2I7zRsIp0Y5s1cEDAV3WyyC6YkShazjbvkTFLkf32s6nGg6N28KFX2dyt14IqhYDEiuQ2tBik2HPRtj0vLeM5NnK0rTIhxJuFg71uAt6uVvJUT3_RjVLhk-eNNNl8hlpi-98woPiLQ-CAx7maDbyYJugk7CPsbQJKERgKnqtuGbd11aNRWnK-Zx0UW9TZ_IlfsoZDvcbZS0wndazwzNeIgNWNzC4ABQTVQeukubfSrvjHtt5BIQq-9lvcGOU_xRN1pzLc0SQ3jjogQ7RktTj5G_fHlGyb6R2s-1A';
      
        let data = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoiMSIsImp1cmlzZGljdGlvbiI6IlNJIiwiY29uc2VudFRpbWVzdGFtcCI6MTEyMjMxMjMxMiwiY29sbGVjdGlvbk1ldGhvZCI6Ik1ldGhvZCIsImNvbnNlbnRSZWNlaXB0SUQiOiIxMjMxNDEyMzEyMzEyMzEyMyIsInB1YmxpY0tleSI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW56eWlzMVpqZk5CMGJCZ0tGTVN2XG52a1R0d2x2QnNhSnE3UzV3QStremVWT1ZwVld3a1dkVmhhNHMzOFhNL3BhL3lyNDdhdjcrejNWVG12RFJ5QUhjXG5hVDkyd2hSRUZwTHY5Y2o1bFRlSlNpYnlyL01ybS9ZdGpDWlZXZ2FPWUlod3JYd0tMcVByLzExaW5Xc0FrZkl5XG50dkhXVHhaWUVjWExnQVhGdVV1YVMzdUY5Z0VpTlF3ekdUVTF2MEZxa3FUQnI0QjhuVzNIQ040N1hVdTB0OFkwXG5lK2xmNHM0T3hRYXdXRDc5SjkvNWQzUnkwdmJWM0FtMUZ0R0ppSnZPd1JzSWZWQ2hEcFlTdFRjSFRDTXF0dldiXG5WNkwxMUJXa3B6R1hTVzRIdjQzcWErR1NZT0QyUVU2OE1iNTlvU2syT0IrQnRPTHBKb2ZtYkdFR2d2bXd5Q0k5XG5Nd0lEQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tIiwibGFuZ3VhZ2UiOiJTSSIsInBpaVByaW5jaXBhbElkIjoiMzEyMyIsInBpaUNvbnRyb2xsZXJzIjpbeyJwaWlDb250cm9sbGVyIjoiVGV4IiwiY29udGFjdCI6InRleCBhdCBmZHMiLCJhZGRyZXNzIjp7fSwiZW1haWwiOiJ0ZXhAZmRzLm9yZyIsInBob25lIjoiMTIzNTQxMjMiLCJwaWlDb250cm9sbGVyVXJsIjoid3d3LmZkcy5vcmcifV0sInNlcnZpY2VzIjpbeyJzZXJ2aWNlIjoiMzEyMyIsInB1cnBvc2VzIjpbeyJwdXJwb3NlIjoiMTIzIiwiY29uc2VudFR5cGUiOiJjb25zZW50IHR5cGUiLCJwdXJwb3NlQ2F0ZWdvcnkiOlsiMTIzMTIiXX1dfV0sImlhdCI6MTU2MDM0NzMwMCwiZXhwIjoxNTYwMzkwNTAwLCJhdWQiOiJhdWRpZW5jZSIsImlzcyI6Imlzc3VlciIsInN1YiI6InN1YmplY3QifQ.AEeJgfPbHWS8ouAZrOPb_DLe7cSyO59hfVIHLicpemn - 5oe7FTM25QhS0FSyKbZXdcYs - prjA6rjwjTatSHWx3xI3wRvH_txMwT2QjZRqSBvVgbaodfkinoIBpHglMezfTTc6dj0ng_ndTFt4N2KL26CqZ_XI - LVfHF5R8h - I8MK5uLzUI6ucGz8EhGTGvKDF_ - jMriWW5ESDMDLkNGNtfa9hdy1tNlR1Ndgs7ZwwOfeFnVbafqBZSUfzYFXuU8MPbOl9oT8dSBIBXO3fNXGuIP291g3X3EMxagveWeMeeNAT8G_o6VLntxG91mwaL5sFO5vwrC2mRetgi99wYmgkw";
        //let data = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoiMSIsImp1cmlzZGljdGlvbiI6IlNJIiwiY29uc2VudFRpbWVzdGFtcCI6MTEyMjMxMjMxMiwiY29sbGVjdGlvbk1ldGhvZCI6Ik1ldGhvZCIsImNvbnNlbnRSZWNlaXB0SUQiOiIxMjMxNDEyMzEyMzEyMzEyMyIsInB1YmxpY0tleSI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW56eWlzMVpqZk5CMGJCZ0tGTVN2XG52a1R0d2x2QnNhSnE3UzV3QStremVWT1ZwVld3a1dkVmhhNHMzOFhNL3BhL3lyNDdhdjcrejNWVG12RFJ5QUhjXG5hVDkyd2hSRUZwTHY5Y2o1bFRlSlNpYnlyL01ybS9ZdGpDWlZXZ2FPWUlod3JYd0tMcVByLzExaW5Xc0FrZkl5XG50dkhXVHhaWUVjWExnQVhGdVV1YVMzdUY5Z0VpTlF3ekdUVTF2MEZxa3FUQnI0QjhuVzNIQ040N1hVdTB0OFkwXG5lK2xmNHM0T3hRYXdXRDc5SjkvNWQzUnkwdmJWM0FtMUZ0R0ppSnZPd1JzSWZWQ2hEcFlTdFRjSFRDTXF0dldiXG5WNkwxMUJXa3B6R1hTVzRIdjQzcWErR1NZT0QyUVU2OE1iNTlvU2syT0IrQnRPTHBKb2ZtYkdFR2d2bXd5Q0k5XG5Nd0lEQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tIiwibGFuZ3VhZ2UiOiJTSSIsInBpaVByaW5jaXBhbElkIjoiMzEyMyIsInBpaUNvbnRyb2xsZXJzIjpbeyJwaWlDb250cm9sbGVyIjoiVGV4IiwiY29udGFjdCI6InRleCBhdCBmZHMiLCJhZGRyZXNzIjp7fSwiZW1haWwiOiJ0ZXhAZmRzLm9yZyIsInBob25lIjoiMTIzNTQxMjMiLCJwaWlDb250cm9sbGVyVXJsIjoid3d3LmZkcy5vcmcifV0sInNlcnZpY2VzIjpbeyJzZXJ2aWNlIjoiMzEyMyIsInB1cnBvc2VzIjpbeyJwdXJwb3NlIjoiMTIzIiwiY29uc2VudFR5cGUiOiJjb25zZW50IHR5cGUiLCJwdXJwb3NlQ2F0ZWdvcnkiOlsiMTIzMTIiXX1dfV0sImlhdCI6MTU2MDM0NjkyNiwiZXhwIjoxNTYwMzkwMTI2LCJhdWQiOiJhdWRpZW5jZSIsImlzcyI6Imlzc3VlciIsInN1YiI6InN1YmplY3QifQ.H9YWCHkav16 - 434n9_uNdZvnmv7mPD029TnPFbTnX8V4A5 - SkD3ExPBENAA9ulhcXqc_LC6HzN1mAhbmb1oVR4Nx5b1GkuUuu9w7fKE9zghT9bT1wrjive7iurKmwTMa3cputWRQ0gJFb1O99uUr - kVp5fu63wvTc5xeLbie14u3atJj5cDRVk4fmrHXXxTCxQuT4Y5uXiBaueYcsstTgyt5CB4LEJi6ARYGRd8iPPdM9HWlLFfHQm6KjgoV2p7T0VBNFBT4_bV - SnUGqB9UwNhnr4OPbXkmX6BT5pTp_D - QOGK5KBvBcvanzE8oDRL5YA7chiGZXZepzxiaFCEydA";
        //let data = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoiMSIsImp1cmlzZGljdGlvbiI6IlNJIiwiY29uc2VudFRpbWVzdGFtcCI6MTEyMjMxMjMxMiwiY29sbGVjdGlvbk1ldGhvZCI6Ik1ldGhvZCIsImNvbnNlbnRSZWNlaXB0SUQiOiIxMjMxNDEyMzEyMzEyMzEyMyIsInB1YmxpY0tleSI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW56eWlzMVpqZk5CMGJCZ0tGTVN2XG52a1R0d2x2QnNhSnE3UzV3QStremVWT1ZwVld3a1dkVmhhNHMzOFhNL3BhL3lyNDdhdjcrejNWVG12RFJ5QUhjXG5hVDkyd2hSRUZwTHY5Y2o1bFRlSlNpYnlyL01ybS9ZdGpDWlZXZ2FPWUlod3JYd0tMcVByLzExaW5Xc0FrZkl5XG50dkhXVHhaWUVjWExnQVhGdVV1YVMzdUY5Z0VpTlF3ekdUVTF2MEZxa3FUQnI0QjhuVzNIQ040N1hVdTB0OFkwXG5lK2xmNHM0T3hRYXdXRDc5SjkvNWQzUnkwdmJWM0FtMUZ0R0ppSnZPd1JzSWZWQ2hEcFlTdFRjSFRDTXF0dldiXG5WNkwxMUJXa3B6R1hTVzRIdjQzcWErR1NZT0QyUVU2OE1iNTlvU2syT0IrQnRPTHBKb2ZtYkdFR2d2bXd5Q0k5XG5Nd0lEQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tIiwibGFuZ3VhZ2UiOiJTSSIsInBpaVByaW5jaXBhbElkIjoiMzEyMyIsInBpaUNvbnRyb2xsZXJzIjpbeyJwaWlDb250cm9sbGVyIjoiVGV4IiwiY29udGFjdCI6InRleCBhdCBmZHMiLCJhZGRyZXNzIjp7fSwiZW1haWwiOiJ0ZXhAZmRzLm9yZyIsInBob25lIjoiMTIzNTQxMjMiLCJwaWlDb250cm9sbGVyVXJsIjoid3d3LmZkcy5vcmcifV0sInNlcnZpY2VzIjpbeyJzZXJ2aWNlIjoiMzEyMyIsInB1cnBvc2VzIjpbeyJwdXJwb3NlIjoiMTIzIiwiY29uc2VudFR5cGUiOiJjb25zZW50IHR5cGUiLCJwdXJwb3NlQ2F0ZWdvcnkiOlsiMTIzMTIiXX1dfV0sImlhdCI6MTU2MDM0NjkyNiwiZXhwIjoxNTYwMzkwMTI2LCJhdWQiOiJhdWRpZW5jZSIsImlzcyI6Imlzc3VlciIsInN1YiI6InN1YmplY3QifQ.H9YWCHkav16 - 434n9_uNdZvnmv7mPD029TnPFbTnX8V4A5 - SkD3ExPBENAA9ulhcXqc_LC6HzN1mAhbmb1oVR4Nx5b1GkuUuu9w7fKE9zghT9bT1wrjive7iurKmwTMa3cputWRQ0gJFb1O99uUr - kVp5fu63wvTc5xeLbie14u3atJj5cDRVk4fmrHXXxTCxQuT4Y5uXiBaueYcsstTgyt5CB4LEJi6ARYGRd8iPPdM9HWlLFfHQm6KjgoV2p7T0VBNFBT4_bV - SnUGqB9UwNhnr4OPbXkmX6BT5pTp_D - QOGK5KBvBcvanzE8oDRL5YA7chiGZXZepzxiaFCEydA"; 
        this.sendContents(this.state.account, this.state.account.subdomain, data,
            (output) => { this.setOutput(output, this); },
            (results) => { this.setResults(results, this);} ); 
    }

    render() {
        let accountComponent = this.state.account ? <Account app={this} account={this.state.account} applicationDomain={window.FDS.applicationDomain} ref={this.state.accountRef} /> : null;
        let accountLogin = this.state.account ? null : <AccountLogin app={this} />;
        let accountSettings = this.state.accountSettingsVisible ? <AccountSettings account={this.state.account} app={this} /> : null;

        let receivedMessages = this.state.account ? <ReceivedMessages account={this.state.account} app={this} consentGen={this.state.consentGen} query="" /> : null;
        let sentMessages = this.state.account ? <SentMessages account={this.state.account} app={this} consentGen={this.state.consentGen} query="" /> : null;
        let contacts = this.state.account ? <Contacts account={this.state.account} app={this} query="" /> : null;

        return (
            <div className="App">
                {accountComponent} 
                {accountLogin} 
                {accountSettings} 
                {receivedMessages} 
                {sentMessages} 
                {contacts}
            <pre>{this.state.completed}</pre>
            <pre>{this.state.results}</pre>
            <pre>{this.state.output}</pre>

            <button onClick={() => this.sendTestToken()}>Send test token </button>
          </div>
        );
      }
}

// eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoiMSIsImp1cmlzZGljdGlvbiI6IlNJIiwiY29uc2VudFRpbWVzdGFtcCI6MTEyMjMxMjMxMiwiY29sbGVjdGlvbk1ldGhvZCI6Ik1ldGhvZCIsImNvbnNlbnRSZWNlaXB0SUQiOiIxMjMxNDEyMzEyMzEyMzEyMyIsInB1YmxpY0tleSI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQW56eWFpczFaamZOQjBiQmdLRk1TdlxudmtUdHdsdkJzYUpxN1M1d0Era3plVk9WcFZXd2tXZFZoYTRzMzhYTS9wYS95cjQ3YXY3K3ozVlRtdkRSeUFIY1xuYVQ5MndoUkVGcEx2OWNqNWxUZUpTaWJ5ci9Ncm0vWXRqQ1pWV2dhT1lJaHdyWHdLTHFQci8xMWluV3NBa2ZJeVxudHZIV1R4WllFY1hMZ0FYRnVVdWFTM3VGOWdFaU5Rd3pHVFUxdjBGcWtxVEJyNEI4blczSENONDdYVXUwdDhZMFxuZStsZjRzNE94UWF3V0Q3OUo5LzVkM1J5MHZiVjNBbTFGdEdKaUp2T3dSc0lmVkNoRHBZU3RUY0hUQ01xdHZXYlxuVjZMMTFCV2twekdYU1c0SHY0M3FhK0dTWU9EMlFVNjhNYjU5b1NrMk9CK0J0T0xwSm9mbWJHRUdndm13eUNJOVxuTXdJREFRQUJcbi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLSIsImxhbmd1YWdlIjoiU0kiLCJwaWlQcmluY2lwYWxJZCI6IjMxMjMiLCJwaWlDb250cm9sbGVycyI6W3sicGlpQ29udHJvbGxlciI6IlRleCIsImNvbnRhY3QiOiJ0ZXggYXQgZmRzIiwiYWRkcmVzcyI6e30sImVtYWlsIjoidGV4QGZkcy5vcmciLCJwaG9uZSI6IjEyMzU0MTIzIiwicGlpQ29udHJvbGxlclVybCI6Ind3dy5mZHMub3JnIn1dLCJzZXJ2aWNlcyI6W3sic2VydmljZSI6IjMxMjMiLCJwdXJwb3NlcyI6W3sicHVycG9zZSI6IjEyMyIsImNvbnNlbnRUeXBlIjoiY29uc2VudCB0eXBlIiwicHVycG9zZUNhdGVnb3J5IjpbIjEyMzEyIl19XX1dLCJpYXQiOjE1NjAzMzU5MTYsImV4cCI6MTU2MDM3OTExNiwiYXVkIjoiYXVkaWVuY2UiLCJpc3MiOiJpc3N1ZXIiLCJzdWIiOiJzdWJqZWN0In0.NCgLVXsmwLsRFsauUPNGcpAioeCK848SkYAURpx28HjvjIEOdA2I7zRsIp0Y5s1cEDAV3WyyC6YkShazjbvkTFLkf32s6nGg6N28KFX2dyt14IqhYDEiuQ2tBik2HPRtj0vLeM5NnK0rTIhxJuFg71uAt6uVvJUT3_RjVLhk-eNNNl8hlpi-98woPiLQ-CAx7maDbyYJugk7CPsbQJKERgKnqtuGbd11aNRWnK-Zx0UW9TZ_IlfsoZDvcbZS0wndazwzNeIgNWNzC4ABQTVQeukubfSrvjHtt5BIQq-9lvcGOU_xRN1pzLc0SQ3jjogQ7RktTj5G_fHlGyb6R2s-1A
export default App;
