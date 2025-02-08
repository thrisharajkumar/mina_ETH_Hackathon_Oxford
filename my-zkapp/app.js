import { Field } from 'snarkyjs';
import DataOwnershipContract from '../contracts/dataOwnership.js';
import CryptoJS from 'crypto-js';
import Torus from '@toruslabs/torus.js';

// Initialize Torus
const torus = new Torus();

async function initializeTorus() {
    await torus.init({
        enableLogging: true,
        network: { host: 'mainnet' }, // Choose the Torus network
    });

    // Trigger Torus authentication
    const userInfo = await torus.login(); // This will open a login popup
    console.log('User Info:', userInfo);

    // Use userInfo to authenticate and generate a token
    const token = userInfo.token;
    console.log('Authentication Token:', token);

    return token;
}

initializeTorus(); // Initialize Torus when the app starts

// Encryption function
function encryptData(data, secretKey) {
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    console.log('Encrypted Data:', ciphertext);
    return ciphertext;
}

// Decryption function
function decryptData(ciphertext, secretKey) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalData = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted Data:', originalData);
    return originalData;
}

// Store encrypted data on Torus
async function storeEncryptedDataOnTorus(data, secretKey) {
    const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
    const key = `data-${Date.now()}`; // Use a unique key for storage
    const result = await torus.setData(key, encrypted);
    console.log(`Data stored on Torus with key: ${key}`, result);
    return key;
}

// Retrieve and decrypt data from Torus
async function retrieveAndDecryptDataFromTorus(key, secretKey) {
    const encrypted = await torus.getData(key);
    console.log('Encrypted Data Retrieved from Torus:', encrypted);

    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const originalData = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted Data:', originalData);
    return originalData;
}

// Instantiate the zkApp
const zkApp = new DataOwnershipContract();

// Simulate initializing the contract with example data
const exampleDataHash = Field(BigInt(12345)); // Simulated hash of user data
const exampleOwner = Field(BigInt(67890));   // Simulated owner ID
zkApp.init(exampleDataHash, exampleOwner);

// Add event listeners for UI interactions
document.getElementById('encryptBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a file first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const fileContent = event.target.result;
        const secretKey = 'my-secret-key';

        // Encrypt and store the file content on Torus
        const storageKey = await storeEncryptedDataOnTorus(fileContent, secretKey);

        // Display the storage key to the user
        document.getElementById('status').innerText = `Data stored on Torus with key: ${storageKey}`;
        console.log(`Data stored with key: ${storageKey}`);
    };
    reader.readAsText(file);
});

document.getElementById('retrieveBtn').addEventListener('click', async () => {
    const secretKey = 'my-secret-key';
    const storageKey = prompt('Enter the storage key to retrieve your data:');

    if (!storageKey) {
        alert('You must provide a storage key.');
        return;
    }

    // Retrieve and decrypt the data from Torus
    const decryptedData = await retrieveAndDecryptDataFromTorus(storageKey, secretKey);

    // Display the decrypted data
    document.getElementById('status').innerText = `Decrypted Data: ${decryptedData}`;
    console.log(`Decrypted Data: ${decryptedData}`);
});

document.getElementById('proofBtn').addEventListener('click', () => {
    // Generate a zk-SNARK proof
    const proof = zkApp.generateProof(exampleDataHash, exampleOwner);
    console.log('Generated Proof:', proof);

    // Verify the zk-SNARK proof
    const isVerified = zkApp.verifyProof(proof);
    document.getElementById('status').innerText = isVerified
        ? 'Proof Verified Successfully!'
        : 'Proof Verification Failed!';
    console.log('Proof Verified:', isVerified);
});
