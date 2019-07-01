// fairdata.js library uses fds.js library to send consent receipt files over Swarm to another account
// 
  
import DataReceiptLib from './DataReceipt.js'; 

var project = require('./sample_consent_project.json'); 
let privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEogIBAAKCAQEAnzyis1ZjfNB0bBgKFMSvvkTtwlvBsaJq7S5wA+kzeVOVpVWw\n' +
    'kWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHcaT92whREFpLv9cj5lTeJSibyr/Mr\n' +
    'm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIytvHWTxZYEcXLgAXFuUuaS3uF9gEi\n' +
    'NQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0e+lf4s4OxQawWD79J9/5d3Ry0vbV\n' +
    '3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWbV6L11BWkpzGXSW4Hv43qa+GSYOD2\n' +
    'QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9MwIDAQABAoIBACiARq2wkltjtcjs\n' +
    'kFvZ7w1JAORHbEufEO1Eu27zOIlqbgyAcAl7q+/1bip4Z/x1IVES84/yTaM8p0go\n' +
    'amMhvgry/mS8vNi1BN2SAZEnb/7xSxbflb70bX9RHLJqKnp5GZe2jexw+wyXlwaM\n' +
    '+bclUCrh9e1ltH7IvUrRrQnFJfh+is1fRon9Co9Li0GwoN0x0byrrngU8Ak3Y6D9\n' +
    'D8GjQA4Elm94ST3izJv8iCOLSDBmzsPsXfcCUZfmTfZ5DbUDMbMxRnSo3nQeoKGC\n' +
    '0Lj9FkWcfmLcpGlSXTO+Ww1L7EGq+PT3NtRae1FZPwjddQ1/4V905kyQFLamAA5Y\n' +
    'lSpE2wkCgYEAy1OPLQcZt4NQnQzPz2SBJqQN2P5u3vXl+zNVKP8w4eBv0vWuJJF+\n' +
    'hkGNnSxXQrTkvDOIUddSKOzHHgSg4nY6K02ecyT0PPm/UZvtRpWrnBjcEVtHEJNp\n' +
    'bU9pLD5iZ0J9sbzPU/LxPmuAP2Bs8JmTn6aFRspFrP7W0s1Nmk2jsm0CgYEAyH0X\n' +
    '+jpoqxj4efZfkUrg5GbSEhf+dZglf0tTOA5bVg8IYwtmNk/pniLG/zI7c+GlTc9B\n' +
    'BwfMr59EzBq/eFMI7+LgXaVUsM/sS4Ry+yeK6SJx/otIMWtDfqxsLD8CPMCRvecC\n' +
    '2Pip4uSgrl0MOebl9XKp57GoaUWRWRHqwV4Y6h8CgYAZhI4mh4qZtnhKjY4TKDjx\n' +
    'QYufXSdLAi9v3FxmvchDwOgn4L+PRVdMwDNms2bsL0m5uPn104EzM6w1vzz1zwKz\n' +
    '5pTpPI0OjgWN13Tq8+PKvm/4Ga2MjgOgPWQkslulO/oMcXbPwWC3hcRdr9tcQtn9\n' +
    'Imf9n2spL/6EDFId+Hp/7QKBgAqlWdiXsWckdE1Fn91/NGHsc8syKvjjk1onDcw0\n' +
    'NvVi5vcba9oGdElJX3e9mxqUKMrw7msJJv1MX8LWyMQC5L6YNYHDfbPF1q5L4i8j\n' +
    '8mRex97UVokJQRRA452V2vCO6S5ETgpnad36de3MUxHgCOX3qL382Qx9/THVmbma\n' +
    '3YfRAoGAUxL/Eu5yvMK8SAt/dJK6FedngcM3JEFNplmtLYVLWhkIlNRGDwkg3I5K\n' +
    'y18Ae9n7dHVueyslrb6weq7dTkYDi3iOYRW8HRkIQh06wEdbxt0shTzAJvvCQfrB\n' +
    'jg/3747WSsf/zBTcHihTRBdAv6OmdhV4/dD5YBfLAkLrd+mX7iE=\n' +
    '-----END RSA PRIVATE KEY-----';

let publicKey = '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv\n' +
    'vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc\n' +
    'aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy\n' +
    'tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0\n' +
    'e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb\n' +
    'V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9\n' +
    'MwIDAQAB\n' +
    '-----END PUBLIC KEY-----';
    
/**
 1. create account 1
 2. unlock account
 3. load project file
 4. load private key
 5. generate cr.jwt token
 6. send cr.jwt token to yourself and wait for delivery
 7. get all received files
   8. for each received file check if its cr.jwt token
   9. decode token
   10. if decoded then verify token display info 

 * @param {any} FDSConfig
 */
export const RunTestDataReceiptLib = async (FDSConfig) => {
    let fd = new DataReceiptLib();

    console.log("Starting test example");

    let password = 'test'
    //let accountName = 'testconsentaccount' + Math.floor(Math.random() * 101010101); 
    let accountName = 'testconsentaccount99987212'; 
    let subjectName = accountName; 
    let newAccount  = await fd.createAccount(accountName, password);
    let account     = await fd.unlockAccount(accountName, password);
    let loadPrivKey = await fd.loadPrivateKey(privateKey);
    let loadSuccess = await fd.loadProject(project);
    let signedToken = await fd.generateToken(); 

    let swarmHash = await fd.sendDataReceipt(signedToken, accountName);

    //
    console.log(fd.account); 
    let userAddress    = fd.account.address;
    let subjectAddress = await fd.account.getAddressOf(subjectName);

    console.log("User   :" + userAddress);
    console.log("Subject:" + subjectAddress);
    
    let CM1 = await fd.getConsentManager(); 
    let tx = await CM1.createConsent(userAddress, subjectAddress, "0x" + swarmHash);
    //console.log(tx); // transaction finished

    let uc = await CM1.getUserConsents();
    console.log('user consents', uc); // user consents

    let sc = await CM1.getSubjectConsents();
    console.log('subject consents', sc); // subject consents

    let cf = await CM1.getConsentsFor("0x" + swarmHash);
    console.log('consents for swarmHash', cf);

    // lets check all user consents 
    await fd.asyncForEach(uc, async (consentAddress) => {
        let consent = await fd.getConsent(consentAddress);
        let us, ss, s, v;

        us = await consent.isUserSigned();
        ss = await consent.isSubjectSigned();
        s = await consent.isSigned();

        console.log(consentAddress, ' signed (subject, user, both)', ss, us, s);
    });

    // sign last user consent as user 
    let last_user_consent = await fd.getConsent(uc[uc.length - 1]); 
    let us = await last_user_consent.isUserSigned();
    if (us === false) {
        console.log("Signing last consent as user");
        console.log(last_user_consent.swarmHash);
        await last_user_consent.signUser();
    }
    // since both parties are from same account
    let ss = await last_user_consent.isSubjectSigned();
    if (ss === false) {
        console.log("Signing last consent as subject");
        console.log(last_user_consent.swarmHash);
        await last_user_consent.signSubject();
    }

    let messages    = await fd.getReceivedMessages(true); 

    console.log(messages);

    console.log("Test example ended");
}

/**
 * 
 * @param {any} dataReceiptLib dataReceiptLib object
 * @returns {token} signedToken, loaded from demo project
 */
export const InitiWithTestProjectCR = async (dataReceiptLib) => {
    //let fd = new Fairdata();
    let loadPrivKey = await dataReceiptLib.loadPrivateKey(privateKey);
    let loadSuccess = await dataReceiptLib.loadProject(project);
    return loadSuccess;
}

/**
 * 
 * @param {any} dataReceiptLib dataReceiptLib object
 * @returns {token} signedToken, loaded from demo project
 */
export const CreateTestDataReceipt = async (dataReceiptLib) =>
{
    let loadPrivKey = await dataReceiptLib.loadPrivateKey(privateKey);
    let loadSuccess = await dataReceiptLib.loadProject(project);
    let signedToken = await dataReceiptLib.generateToken();
    return signedToken;
}
