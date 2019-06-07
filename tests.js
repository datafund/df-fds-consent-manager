
async function getMultiboxData(account) {
    var multiboxData = await account.Mail.Multibox.traverseMultibox(account, account.subdomain);
    console.log(multiboxData);
    return multiboxData;
}

async function checkApplicationDomain(account, applicationDomain, multiboxAddress, kvtId = 0) {
    console.log("checkApplicationDomain", account, applicationDomain, multiboxAddress, kvtId);

    let applicationNodeExists = await account.Mail.Multibox.createPath(account, applicationDomain, multiboxAddress, kvtId);
    console.log(applicationNodeExists + " " + applicationDomain);
    if (applicationNodeExists > 0) {
        console.log("Application domain created");
    }
    return applicationNodeExists;
}

async function sendContents(fromAccount, toAccount, applicationDomain, message) {
    console.log(`${fromAccount.subdomain} sending to ${toAccount}`);
    let r = Math.floor(Date.now());
    let file = new File([`fds-${r}-message: ${message}`], `fds-msg-${r}.txt`, { type: 'text/plain' });

    try {
        let result = await fromAccount.send(toAccount, file, applicationDomain, console.log, console.log, console.log);
        console.log(`${fromAccount.subdomain} sent ${result} >>>> ${toAccount}`);
        return result;
    } catch (err) {
        console.error(err);
        try {
            if (err.search("pubKey") !== -1)
                console.log("Probably recepient does not exits");
        } catch (err2) {
            console.error(err2);
        }
    }
}

async function createRandomAccount(setOutput, setResults) {
    let r1 = Math.floor(Math.random() * 101010101);
    let account = await window.FDS.CreateAccount(`test${r1}`, 'test', setOutput);

    setOutput("account created:" + JSON.stringify(account));
    setOutput("unlocking...");
    await window.FDS.UnlockAccount(account.subdomain, "test");
    return account;
}

async function initAccount(account, applicationDomain, setOutput, setResults) {

    setOutput(account.subdomain + " create application domain node (if it does not exist)" + applicationDomain);
    let appdomain = await account.setApplicationDomain(applicationDomain);
    setOutput(account.subdomain + " get multibox data (contract address, kvt contract addresses and full tree)");
    let multiboxData = await getMultiboxData(account);

    setOutput(account.subdomain + " Check and/or create appDomain node" + applicationDomain);
    let cad1 = await checkApplicationDomain(account, applicationDomain, multiboxData.id, 0);

    setOutput(account.subdomain + " applicationDomain Node:" + JSON.stringify(cad1));
}

async function twoAccountsSendingToEachOther(setOutput, setResults) {
    let applicationDomain = "/shared/fairdrop/";

    let account1 = await createRandomAccount(setOutput, setResults);
    await initAccount(account1, applicationDomain, setOutput, setResults);

    setOutput("><><><><><><><><><><<><><><><><><><><><><><><><><><>");
    setOutput("><><><><><><><><>  2nd ACCOUNT <><><><><><><><><><><");
    let account2 = await createRandomAccount(setOutput, setResults);
    await initAccount(account2, applicationDomain, setOutput, setResults);

    setOutput("><><><><><><><><><><<><><><><><><><><><><><><><><><>");
    setOutput("><><><><><><><><><> TEST SEND <><><><><><><><><><><>");
    let messages1 = await account1.messages('received', applicationDomain);
    let messages2 = await account2.messages('received', applicationDomain);
    setOutput(">>> BEFORE SEND ");
    setOutput("1st msgs:" + JSON.stringify(messages1));
    setOutput("1nd msgs:" + JSON.stringify(messages2));

    setOutput(">>> SEND 1 to 2 ");
    await sendContents(account1, account2.subdomain, applicationDomain, "ello yello");

    setOutput(">>> MESSAGES AT 2");
    messages2 = await account2.messages('received', applicationDomain);
    setOutput("2st msgs:" + JSON.stringify(messages2));

    setOutput(">>> READING MESSAGES IMMEDIATLY CAN MISS AS IT NEEDS SOME TIME TO BE RECEIVED");

    setOutput(">>> SEND 2 to 1 ");
    await sendContents(account2, account1.subdomain, applicationDomain, "yellow hellow");
    setOutput(">>> MESSAGES AT 2 ");
    messages1 = await account1.messages('received', applicationDomain);
    setOutput("1st msgs:" + JSON.stringify(messages1));

    setOutput(">>> CHECK AGAIN ");
    messages1 = await account1.messages('received', applicationDomain);
    messages2 = await account2.messages('received', applicationDomain);
    setOutput("1st msgs:" + JSON.stringify(messages1));
    setOutput("2st msgs:" + JSON.stringify(messages2));

    console.log(messages1);
    console.log(messages2);
}