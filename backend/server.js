const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const { CustomAuth } = require('@toruslabs/customauth');
const { Field } = require('snarkyjs'); // For zk-SNARK proof logic
const DataOwnershipContract = require('../contracts/dataOwnership'); // Import your smart contract logic

const app = express();
const PORT = 5000; // Backend server port

app.use(bodyParser.json());

/**
 * Initialize Torus
 */
let torusInstance; // To hold the initialized Torus instance
async function initializeTorus() {
    torusInstance = new CustomAuth({
        baseUrl: 'http://localhost:3000/serviceworker', // Replace with your frontend URL
        enableLogging: true,
        network: 'mainnet', // Torus mainnet
    });

    try {
        await torusInstance.init();
        console.log('Torus initialized');
    } catch (error) {
        console.error('Error initializing Torus:', error);
    }
}
initializeTorus();

/**
 * API Endpoint: Encrypt and Store Data on Torus
 */
app.post('/store', async (req, res) => {
    try {
        const { data, secretKey } = req.body;

        // Encrypt the data
        const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
        console.log('Encrypted Data:', encrypted);

        // Store the encrypted data on Torus
        const key = `data-${Date.now()}`;
        await torusInstance.setData(key, encrypted);
        console.log(`Data stored with key: ${key}`);

        res.json({ success: true, key });
    } catch (error) {
        console.error('Error storing data:', error);
        res.status(500).json({ success: false, error: 'Failed to store data' });
    }
});

/**
 * API Endpoint: Retrieve and Decrypt Data from Torus
 */
app.post('/retrieve', async (req, res) => {
    try {
        const { key, secretKey } = req.body;

        // Retrieve the encrypted data from Torus
        const encrypted = await torusInstance.getData(key);
        console.log('Encrypted Data Retrieved:', encrypted);

        // Decrypt the data
        const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
        const originalData = bytes.toString(CryptoJS.enc.Utf8);
        console.log('Decrypted Data:', originalData);

        res.json({ success: true, data: originalData });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve data' });
    }
});

/**
 * API Endpoint: zk-SNARK Proof Generation
 */
app.post('/generate-proof', (req, res) => {
    try {
        const { dataHash, owner } = req.body;

        // Instantiate the contract
        const zkApp = new DataOwnershipContract();
        zkApp.init(Field(BigInt(dataHash)), Field(BigInt(owner)));

        // Generate the proof
        const proof = zkApp.generateProof(Field(BigInt(dataHash)), Field(BigInt(owner)));
        console.log('Generated Proof:', proof);

        res.json({ success: true, proof });
    } catch (error) {
        console.error('Error generating proof:', error);
        res.status(500).json({ success: false, error: 'Failed to generate proof' });
    }
});

/**
 * API Endpoint: zk-SNARK Proof Verification
 */
app.post('/verify-proof', (req, res) => {
    try {
        const { proof, dataHash, owner } = req.body;

        // Instantiate the contract
        const zkApp = new DataOwnershipContract();
        zkApp.init(Field(BigInt(dataHash)), Field(BigInt(owner)));

        // Verify the proof
        const isVerified = zkApp.verifyProof(proof);
        console.log('Proof Verified:', isVerified.toBoolean());

        res.json({ success: true, verified: isVerified.toBoolean() });
    } catch (error) {
        console.error('Error verifying proof:', error);
        res.status(500).json({ success: false, error: 'Failed to verify proof' });
    }
});

/**
 * Start the Backend Server
 */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
