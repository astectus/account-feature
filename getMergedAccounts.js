//Test the solution by running "node getMergedAccounts.js"

/*
Solution to the problem:
In order to minimise the number of loops needed in order to find and update the person object I decided to use
hashtable in order to check for references and occurrences. The complexity is O(1) for insertion/ deletion and lookup for
hash tables which is much better than working with arrays.
I used 2 hashtable, one hashtable reflects the assigned person index for each mail reference (mailHashTable), the second one
represents the hashtable of the actual "Persons" which is used for constantly updating the data (personHashTable).

I used for loops most of the time, we could replace it with forEach or map array functions.

Ex. mailHashTable:
{
  'a@gmail.com: 0,
  'b@gmail.com: 0,
  'c@gmail.com: 1,
  'd@gmail.com: 1,
}

Ex. personHashTable:
{
  0:{
  "applications": [1,2],
  "emails": ["a@yahoo.com", "b@gmail.com"],
  "name": "A"
  },
  1:{
  "applications": [3,4],
  "emails": ["c@gmail.com", "d@gmail.com"],
  "name": "B"
  },
}
*/


// Reads the json file and assigns the output to a constant.
const accountListUrl = './accounts.json';


// Checks if the file exists, if not then notify the user.
// If there is some other error unrelated to missing file then throw an error.
function getAccountList() {
    let accountList;
    try {
        accountList = require(accountListUrl);
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
        } else {
            console.log('ERROR: Please check if the required file exists in the directory.');
            return;
        }
    }
    return accountList;
}


// Pure function that creates and returns the "Person" object by combining already created "Person" objects with an "Account" object.
// Person object can be array, object or undefined.
function createPersonObject(accountObject, personObjects) {
    if (!personObjects) {
        return {
            applications: [accountObject.application],
            emails: accountObject.emails,
            name: accountObject.name,
        }
    }

    // Draft person object
    let updatedPerson = {
        applications: [],
        emails: [],
        name: '',
    }

    // If there is only one "Person" object available, no need to run the loop.
    if (personObjects && !Array.isArray(personObjects)) {
        updatedPerson = personObjects
    } else {
    // Loop through the "Person" objects in order to create a combined "Person"object
        for (let i = 0; i < personObjects.length; i++) {
            updatedPerson = {
                applications: Array.from(new Set([...updatedPerson.applications, ...personObjects[i].applications])),
                emails: Array.from(new Set([...updatedPerson.emails, ...personObjects[i].emails])),
                name: personObjects[i].name
            }
        }
    }

    // I used "Set" object in order to remove duplicates.
    return {
        ...updatedPerson,
        applications: Array.from(new Set([...updatedPerson.applications, accountObject.application])),
        emails: Array.from(new Set([...updatedPerson.emails, ...accountObject.emails])),
    }
}

function mergeAccounts() {
    const accounts = getAccountList();

    if (!accounts) {
        return;
    }
    // Check if the result property is of type array
    if (!Array.isArray(accounts)) {
        console.log('Provided data is not of type array!');
        return;
        // Check if the array list is empty.
    } else if (accounts.length === 0) {
        console.log('Account list is empty!');
        return;
    }

    // Email map which keeps reference of the assigned Person index.
    let mailHashTable = {}
    // Person hashtable containing the updatable Person object.
    let personHashTable = {}

    // Iterate through the list of accounts;
    for (let i = 0; i < accounts.length; i++) {

        // Reference of the previous email, needed in order to group occurring mails
        let previousEmail;

        // Iterate through the list of emails of each account.
        for (let j = 0; j < accounts[i].emails.length; j++) {
            // Created  current iterable mail placeholder "currentEmail" for better readability.
            const currentEmail = accounts[i].emails[j];
            // If we don't find references in the "mailHashTable" and it is the first mail from the list, then create a new record right away in both hashtables.
            if (mailHashTable[currentEmail] === undefined && !previousEmail) {
                mailHashTable[currentEmail] = i;
                personHashTable[i] = createPersonObject(accounts[i]);
                previousEmail = currentEmail;
            } else {
                // If "previousEmail" is defined, then we need to make sure to assign the next mail to the same person as the "previousEmail".
                if (previousEmail && previousEmail !== currentEmail) {
                    // If we find that there is a registry already for the currentEmail in "personHashTable", then we combine all of them into one.
                    if (personHashTable[mailHashTable[currentEmail]]) {
                        personHashTable[mailHashTable[previousEmail]] =
                            createPersonObject(accounts[i], [personHashTable[mailHashTable[previousEmail]], personHashTable[mailHashTable[currentEmail]]]);
                        // Deleting "currentEmail" personObject because it was already merged with "previousObject".
                        delete personHashTable[mailHashTable[currentEmail]];
                    } else {
                        // If we don't find any references, then we just update the previous person reference with the new data.
                        personHashTable[mailHashTable[previousEmail]] = createPersonObject(accounts[i], personHashTable[mailHashTable[previousEmail]]);
                    }
                    // Updating the current mail reference with the new "Person" index
                    mailHashTable[currentEmail] = mailHashTable[previousEmail];
                } else {
                    // Update previousMail reference.
                    previousEmail = currentEmail;
                    // If we don't have a previousEmail defined but the current mail occurred already, then we update "personHashTable" with new account data
                    personHashTable[mailHashTable[currentEmail]] = createPersonObject(accounts[i], personHashTable[mailHashTable[currentEmail]]);
                }
            }
        }
    }

    // Convert hashTable into an array.
    return Object.values(personHashTable);
}

console.log(mergeAccounts());
