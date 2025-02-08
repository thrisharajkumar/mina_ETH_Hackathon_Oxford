import { SmartContract, Field, Bool, CircuitValue, Poseidon } from 'snarkyjs';

// Define the proof class
class OwnershipProof extends CircuitValue {
    constructor(dataHash, owner) {
        super();
        this.dataHash = dataHash;
        this.owner = owner;
    }

    hash() {
        return Poseidon.hash([this.dataHash, this.owner]);
    }
}

class DataOwnershipContract extends SmartContract {
    // Initialize state variables with valid Field values
    dataHash = Field(0); // Default value for dataHash
    owner = Field(0);    // Default value for owner

    init(dataHash, owner) {
        this.dataHash = dataHash;
        this.owner = owner;
    }

    generateProof(dataHash, owner) {
        const proof = new OwnershipProof(dataHash, owner);
        console.log('Generated Proof Hash:', proof.hash().toString());
        return proof;
    }

    verifyProof(proof) {
        const isValid = proof.hash().equals(Poseidon.hash([this.dataHash, this.owner]));
        console.log('Proof Verified:', isValid.toBoolean());
        return isValid;
    }
}

export default DataOwnershipContract;
