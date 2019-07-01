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


let Web3Utils = require('web3-utils');
let EthCrypto = require('eth-crypto');

let ConsentContract = require('../contracts/Consent.json');

class Consent {

    constructor(FDSAccount, contractAddress, swarmHash) {
        this.account = FDSAccount;
        this.contractAddress = contractAddress;
        this.swarmHash = swarmHash;
        this.con = FDSAccount.getContract(ConsentContract.abi, ConsentContract.bytecode, contractAddress);
    }

    sign(){
      let h = this.swarmHash;

      const sigg = EthCrypto.sign(
          this.account.privateKey,
          h
      );

      var sig = sigg.slice(2);
      var v = Web3Utils.toDecimal(sig.slice(128, 130));
      var r = `0x${sig.slice(0, 64)}`;
      var s = `0x${sig.slice(64, 128)}`;

      return {
        h: h, 
        v: v, 
        r: r, 
        s: s
      }     
    }

    async getSwarmHash() {
        this.swarmHash = await this.con.call('swarmHash', []);
        return this.swarmHash;
    }

    async dataUser(){
        return await this.con.call('dataUser', []);
    }

    async signUser(){
      let sig = this.sign();      
        return await this.con.send('signUser',[sig.h, sig.v, sig.r, sig.s]);
    }

    async dataSubject(){
        return await this.con.call('dataSubject', []);
    }

    async signSubject(){
      let sig = this.sign();
        return await this.con.send('signSubject',[sig.h, sig.v, sig.r, sig.s]);
    }  

    async isUserSigned(){
        return await  this.con.call('isUserSigned', []);
    }

    async isSubjectSigned(){
        return await this.con.call('isSubjectSigned', []);
    }

    async isSigned(){
        return await this.con.call('isSigned', []);
    }

    async isValid(){
        return await this.con.call('isValid', []);
    }

    async revokeConsent(){
      return await this.con.send('revokeConsent', []);
    }

    async isUpdatedWith() {
        return await this.con.call('updatedConsent', []);
    }

    async status() {
        return await this.con.call('status', []);
    }
}

export default Consent