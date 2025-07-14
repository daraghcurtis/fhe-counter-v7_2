# EncryptMultipleValues Quick Start

Shows how to use FHEVM to securely store and compute encrypted insurance profile data.  
Each profile includes multiple encrypted rate factors, which are summed confidentially on-chain to compute a premium.

---

## Setup

1. Start the local Hardhat node in a separate terminal:
```bash
npx hardhat node
```

2. (New terminal window) Clean the project and compile the contracts:
```bash
npx hardhat clean
npx hardhat compile
```

3. Deploy the EncryptMultipleValues contract:
```bash
npx hardhat --network localhost deploy --tags EncryptMultipleValues
```

4. Run the test suite:
```bash
npx hardhat test test/04_EncryptMultipleValues.ts
```

---

## Sepolia Testnet Setup

1. Set your `.env` file:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

2. Deploy to Sepolia:
```bash
npx hardhat deploy --network sepolia --tags EncryptMultipleValues
```

3. Run encryption and submission task:
```bash
npx hardhat --network sepolia task:sendEncryptedBatches --contract <DEPLOYED_CONTRACT_ADDRESS>
```

---

- Contract: `EncryptMultipleValues.sol`
- Task script: `tasks/04_EncryptMultipleValuesTask.ts`
- Test file: `test/04_EncryptMultipleValues.ts`
