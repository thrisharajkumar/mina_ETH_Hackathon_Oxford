import { Field } from 'snarkyjs';
import DataOwnershipContract from '../contracts/dataOwnership.js';
import CryptoJS from 'crypto-js';


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

// Instantiate the contract
const zkApp = new DataOwnershipContract();

// Simulate initializing the contract with example data
const exampleDataHash = Field(BigInt(12345)); // Simulated hash of user data
const exampleOwner = Field(BigInt(67890));   // Simulated owner ID
zkApp.init(exampleDataHash, exampleOwner);

// Encrypt some data
const secretKey = 'my-secret-key';
const originalData = 'Sensitive User Data';
const encryptedData = encryptData(originalData, secretKey);

// Simulate storing the encrypted data (e.g., on Torus)
console.log('Simulated Stored Data:', encryptedData);

// Generate a zk-SNARK proof
const proof = zkApp.generateProof(exampleDataHash, exampleOwner);

// Verify the zk-SNARK proof
zkApp.verifyProof(proof);

// Decrypt the data when retrieved
const decryptedData = decryptData(encryptedData, secretKey);
console.log('Final Decrypted Data:', decryptedData);
