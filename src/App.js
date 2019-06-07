import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FDS from 'fds';

import Account from './components/Account';
import AccountLogin from './components/AccountLogin';
import AccountSettings from './components/AccountSettings.js';

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
          accountSettingsVisible: true,
          balance: "...",
          completed: "",
          output: "",
          results: "",

          accountRef: React.createRef()
      }
    }

    toggleAccountSettings() { this.setState({ accountSettingsVisible: !this.state.accountSettingsVisible }); }

    async setAccount(acc) {
        this.setState({ account: acc });
        acc.setApplicationDomain(window.FDS.applicationDomain);
    }
    async setBalance(b) {
        this.setState({ balance: "" + b.substr(0, b.length - 1) });
    }
    setOutput(output, context) {
        context.setState({ output: this.state.output + '\n' + output });
    }
    setResults(results, context) {
        context.setState({ completed: this.state.completed + 1, results: this.state.results + '\n' + results });
    }  

    render() {
        let accountComponent = this.state.account ? <Account app={this} account={this.state.account} applicationDomain={window.FDS.applicationDomain} ref={this.state.accountRef} /> : null;
        let accountLogin = this.state.account ? null : <AccountLogin app={this} />;
        let accountSettings = this.state.accountSettingsVisible ? <AccountSettings account={this.state.account} app={this} /> : null;

        return (
            <div className="App">
                {accountComponent} 
                {accountLogin} 
                {accountSettings} 
            <pre>{this.state.completed}</pre>
            <pre>{this.state.results}</pre>
            <pre>{this.state.output}</pre>
          </div>
        );
      }
}

export default App;
