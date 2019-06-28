# df-fds-consent-manager 

Send your consents securely to other FDS users

Consent manager with pure awesomenes of FDS.js 

## Installation

1. clone the FDS.js repo
2. change directory to the FDS repo (MULTIBOX branch)
3. run `npm link` in this directory, you should have output similar to...  
`/Users/user/.nvm/versions/node/v8.11.2/lib/node_modules/fds -> /Users/user/Code/df/FDS`
4. clone this repo and cd into it
5. run `npm install`
6. run `npm link fds`, you should have output similar to...
`/Users/user/Code/df/fds-consent-manager/node_modules/fds -> /Users/user/.nvm/versions/node/v8.11.2/lib/node_modules/fds -> /Users/user/Code/df/FDS`
7. run `npm start`
8. you should be able to access the project using Chrome at http://localhost:3000 

## Fairdata.js test implementation 
 fairdata.js library uses fds.js library to send consent receipt files over Swarm to another account
 
 1. create account  
 2. unlock account 
 3. load project file 
 4. load private key 
 5. generate cr.jwt token
 6. send cr.jwt token to yourself and wait for delivery 
 7. get all received files
 8. for each received file check if its cr.jwt token 
 9. decode token and verify 
 10. log out all messages that are cr.jwt tokens
 
 ## sample data 

 