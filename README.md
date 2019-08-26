# df-fds-consent-manager 

Send your consents securely to other FDS users

Consent manager with pure awesomenes of FDS.js 

## Installation

1. clone the [FDS.js](https://github.com/fairDataSociety/fds.js) repo
2. change directory to the FDS repo (MULTIBOX branch)
3. run `npm link` in this directory, you should have output similar to...  
`/Users/user/.nvm/versions/node/v8.11.2/lib/node_modules/fds -> /Users/user/Code/df/FDS`
4. clone this repo and cd into it
5. run `npm install`
6. run `npm link fds`, you should have output similar to...
`/Users/user/Code/df/fds-consent-manager/node_modules/fds -> /Users/user/.nvm/versions/node/v8.11.2/lib/node_modules/fds -> /Users/user/Code/df/FDS`
7. run `npm start`
8. you should be able to access the project using Chrome at http://localhost:3000 

## DataReceipt.js test implementation 
 DataReceipt.js library uses fds.js library to send consent receipt files over Swarm to another account

 to run it uncomment line 35 in App.js
 
 1. create account  
 2. unlock account 
 3. load project file 
 4. load private key 
 5. generate cr.jwt token
 6. send cr.jwt token to accountname/yourself and wait for delivery 
 7. get all received files
 8. for each received file check if its cr.jwt token 
 9. decode token and verify 
 10. log out all messages that are cr.jwt tokens
 
 ### ConsentManager and Consent contracts 

 Library provides functionality to create new consents on noordung blockchain. 

####  get consent manager
  `let CM = await fd.getConsentManager();` 
  `let tx = await CM.createConsent(userAddress, subjectAddress, "0x" + swarmHash);`

####  Get existing consents where account is user
  `let uc = await CM.getUserConsents();`

#### Get existing consents where account is subject
  `let sc = await CM.getSubjectConsents();`

####  Get consents for swarmHash 
  `let cf = await CM.getConsentsFor("0x" + swarmHash);` 

####  Get consent from address 
  `let consent = await fd.getConsent(address);` 	 

####  Sign last user consent as user 
  `let us = await consent.isUserSigned();`
  `await consent.signUser();`

####  Sign last user consent as subject  
  `let ss = await consent.isSubjectSigned();`
  `await consent.signSubject();`

####  Update consent with new location  
   `let tx = await CM.updateConsent(consent, "0x" + newSwarmHash);`

Updating consent will revoke updated one, and create new one. Old one will have property 
  `updatedConsent` changed from 0x0000000000000000000000000000000000000000  

####  Getting info on updated consents 
   If updated anything else than address(0x0) then consent was updated with another consent 
     `updated = await consent.isUpdatedWith();`
	updated will contain address of updated consent    

#### Checking signatures
 `us = await consent.isUserSigned();`
 `ss = await consent.isSubjectSigned();`
 `s = await consent.isSigned();`
 `v = await consent.isValid();`

#### Checking consent status 
  `status = await consent.status();` 
	 Status values: 
     0 - waiting for signatures
     1 - active 
     2 - expired
     3 - revoked 
     
   
 ## sample data 

 
