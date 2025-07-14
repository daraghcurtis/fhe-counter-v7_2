# FHEMULTIProfileStorage Quick Start

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

3. Deploy the FHEMULTIProfileStorage contract:
```bash
npx hardhat --network localhost deploy --tags FHEMULTIProfileStorage
```

4. Run the test suite:
```bash
npx hardhat test test/03_FHE_Profile_Multi_3.test.ts
```

---

## Sepolia Testnet Setup

1. Set your `.env` file:
```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_FHEPROFILE_CONTRACT=0xYourDeployedSepoliaAddress
```

2. Deploy to Sepolia:
```bash
npx hardhat deploy --network sepolia --tags FHEMULTIProfileStorage
```

3. Run the Sepolia test:
```bash
npx hardhat test test/03_FHE_Profile_Multi_3.test.ts --network sepolia
```

---

- Contract: `FHEProfileStorage.sol`
- Profile input file: `testData/profile3.json`
- Task script: `03_FHE_Profile_Multi_3.test.ts`
