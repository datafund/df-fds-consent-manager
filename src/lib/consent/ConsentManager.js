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


//let Web3Utils = require('web3-utils');

import Consent from "./Consent.js"

let ConsentManagerContract = require('../contracts/ConsentManager.json');
let ConsentContract = require('../contracts/Consent.json');

class ConsentManager {

    constructor(FDSAccount) {
        let contractAddress = '0xdF5d8942342a06EF0ddC46E564a7963DF71eA23B';
        this.account = FDSAccount;
        this.cm = FDSAccount.getContract(ConsentManagerContract.abi, ConsentManagerContract.bytecode, contractAddress);
    }

    // create a consent
    createConsent(userAddress, subjectAddress, swarmHash){
      return this.cm.send('createConsent', [userAddress, subjectAddress, swarmHash]);
    }

    
    async getConsentAt(consentContractAddress) {
        let consentObject = await new Consent(this.account, consentContractAddress, "0x0");
        //let consent = await this.account.getContract(ConsentContract.abi, ConsentContract.bytecode, consentContractAddress);
        return consentObject;
    }

    // get user consents
    getUserConsents(address = false){
      return this.cm.call('getUserConsents', []);
    }

    // get subject consents
    getSubjectConsents(address = false){
      return this.cm.call('getSubjectConsents', []);
    }

    // get consents for swarmHash
    getConsentsFor(swarmHash){
      return this.cm.call('getConsentsFor', [swarmHash]);
    }

    // update existing consents with new location
    updateConsent(consentAddress, swarmHash){
      return this.cm.call('updateConsent', [consentAddress, swarmHash]);
    }

}

export default ConsentManager;