//Test the solution by running "node getMergedAccounts.js"

/*
Solution to the problem:
In order to minimise the number of loops needed in order to find and update the person object I decided to use
hashtable in order to check for references and occurrences. The complexity is O(1) for insertion/ deletion and lookup for
hash tables which is much better than working with arrays.
I used 2 hashtable, one hashtable reflects the assigned person index for each mail reference (mailHashTable), the second one
represents the hashtable of the actual "Persons" which is used for constantly updating the data (personAccountsHashTable).

I used for loops most of the time, we could replace it with forEach or map array functions.

Ex. mailHashTable:
{
  'a@gmail.com: 0,
  'b@gmail.com: 0,
  'c@gmail.com: 1,
  'd@gmail.com: 1,
}

Ex. personAccountsHashTable:
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


// Pure function that creates and returns the "Person" object by combining "Account" objects.
function createPersonObject(accounts) {

    // Draft person object
    let updatedPerson = {
        applications: [],
        emails: [],
        name: '',
    }

    // Loop through the "Accounts" objects in order to create a combined "Person"object
    for (let i = 0; i < accounts.length; i++) {
        // I used "Set" object in order to remove duplicates.
        updatedPerson = {
            applications: Array.from(new Set([...updatedPerson.applications, accounts[i].application])),
            emails: Array.from(new Set([...updatedPerson.emails, ...accounts[i].emails])),
            name: accounts[i].name
        }
    }

    return updatedPerson;
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
    let emailHashTable = {}
    // Person hashtable containing the updatable Person object.
    let personAccountsHashTable = {}

    // Iterate through the list of accounts;
    for (let i = 0; i < accounts.length; i++) {

        // Temporary person Index for defining to which Person to add this account.
        let tempPersonIndex;
        // Array of "Person" indexes that would be merged into "Person" under "personAccountIndex"
        let futureMergePersonIndexArray = []

        // Iterate through the list of emails of each account.
        // Here we define to which "personAccountIndex" we will assign the current "Account"
        for (let j = 0; j < accounts[i].emails.length; j++) {
            // Created  current mail placeholder "currentEmail" for better readability.
            const currentEmail = accounts[i].emails[j];
            // Check if there is already a registry with the currentEmail in emailHashTable.
            const existingEmailPersonIndex = emailHashTable[currentEmail];

            //  If there is a registry of the currentEmail, then we push the assigned "Person" index to a "futureMergePersonIndexArray"
            if (existingEmailPersonIndex !== undefined) {
                futureMergePersonIndexArray.push(existingEmailPersonIndex)
            }

            // If no "tempPersonAccountIndex", then define one based on "existingEmailPersonIndex" or based on "i"
            if (tempPersonIndex === undefined) {
                tempPersonIndex = existingEmailPersonIndex === undefined ? i : existingEmailPersonIndex;
            } else {
                // If there is already a defined "tempPersonIndex", then check if the current "emailPersonIndex" is lower the "tempPersonIndex"
                // If "emailPersonIndex" if lower, then new "tempPersonIndex" is assigned
                if (existingEmailPersonIndex !== undefined) {
                    if (tempPersonIndex > existingEmailPersonIndex) {
                        tempPersonIndex = existingEmailPersonIndex;
                    }
                }
            }
        }

        // Based on found or created "tempPersonIndex", we update the "Person" list with current account.
        if (!personAccountsHashTable[tempPersonIndex]) {
            personAccountsHashTable[tempPersonIndex] = [accounts[i]];
        } else {
            personAccountsHashTable[tempPersonIndex].push(accounts[i]);
        }

        // This loop updated the "personAccountsHashTable" based on "futureMergePersonIndexArray" and "tempPersonIndex"
        const emailHashTableArray = Object.entries(emailHashTable);
        // Iterating through already defined emailPersonIndexes and updating them if they occur in "futureMergePersonIndexArray"
        for (let z = 0; z < emailHashTableArray.length; z++) {
            const email = emailHashTableArray[z][0];
            // Skip step if "tempPersonIndex" is equal to "z"
            const accountIndex = emailHashTableArray[z][1] !== tempPersonIndex ? emailHashTableArray[z][1] : undefined;

            // Update/delete "Person" list of accounts based on occurrences inside "futureMergePersonIndexArray"
            if (accountIndex !== undefined && futureMergePersonIndexArray.includes(accountIndex)) {
                const accountsToMerge = personAccountsHashTable[accountIndex];
                if (accountsToMerge) {
                    personAccountsHashTable[tempPersonIndex].push(...accountsToMerge);
                    delete personAccountsHashTable[accountIndex]
                }
                emailHashTable[email] = tempPersonIndex;
            }
        }

        // This loop updates the "emailHashTable" with new "Person" indexes.
        for (let y = 0; y < accounts[i].emails.length; y++) {
            const email = accounts[i].emails[y];
            emailHashTable[email] = tempPersonIndex;
        }
    }

    // Convert "personAccountsHashTable" into an array of "Persons"
    return Object.values(personAccountsHashTable).map( accounts => createPersonObject(accounts));
}
console.log(mergeAccounts());
