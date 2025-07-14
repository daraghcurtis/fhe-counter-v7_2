# EncryptMultipleValuesProfiles Quick Start

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

3. Deploy the EncryptMultipleValuesProfiles contract:
```bash
npx hardhat --network localhost deploy --tags EncryptMultipleValuesProfiles
```

4. Run the test suite:
```bash
npx hardhat test test/05_EncryptMultipleValuesTestProfiles.ts --network localhost
```

---

## Sepolia Testnet Setup

1. Set your `.env` file:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<KEY>
PRIVATE_KEY="0x"
SEPOLIA_FHEPROFILE_CONTRACT=0x
```

2. Deploy to Sepolia:
```bash
npx hardhat --network sepolia deploy --tags EncryptMultipleValuesProfiles
```

3. Run encryption and submission task:
```bash
npx hardhat --network sepolia task:sendProfileBatches
```

---

- Contract: `EncryptMultipleValuesProfiles.sol`
- Task script: `tasks/05_EncryptMultipleValuesTaskProfiles.ts`
- Test file: `test/05_EncryptMultipleValuesTestProfiles.ts`
