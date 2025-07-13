# 🔐 EncryptMultipleValuesProfiles – Zama FHEVM with Dynamic Profile Input

This project builds on Zama's FHEVM to support confidential insurance premium calculations. It extends the original EncryptMultipleValues contract to dynamically read profile data from a JSON file and compute fully encrypted results on-chain.

Two profiles are processed per batch, each with 9 encrypted values:
- 1 global Base_Premium
- 8 variable-specific Rate_Factor_Value entries

The premium is calculated using:
```
Base_Premium × (1 + sum of 8 encrypted variables)
```

---

## Setup

1. **Start your local node** (optional):
```bash
npx hardhat node
```

2. **Compile contracts**:
```bash
npx hardhat clean
npx hardhat compile
```

---
## Deploy to localhost

```bash
npx hardhat --network localhost deploy --tags EncryptMultipleValuesProfiles
```

## Run Local Tests

To validate everything locally:
```bash
npx hardhat test test/05_EncryptMultipleValuesTestProfiles.ts --network localhost
```

## Run Task files for local testing

To validate everything locally:
```bash
$ npx hardhat --network localhost task:sendProfileBatches
```

---
## Deploy to Sepolia (Testnet)

1. Add `.env` file to your root:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/8mg6C5xQlsJDhRs2CXhyGwD2Pea1B8DF
PRIVATE_KEY="936b1f255e828f28fa0044fbe5df757dc078e71456fc4f64382b208a4a8500d4"
SEPOLIA_FHEPROFILE_CONTRACT=0x8cb5Fb0B5fd5D266Ae8a5cA95422969BeA228Ea6
```

2. Deploy the contract:
```bash
npx hardhat --network sepolia deploy --tags EncryptMultipleValuesProfiles
```

---

## Send Encrypted Profile Data

All profiles in `testData/profile5.json` will be processed in pairs and sent to the contract:

```bash
npx hardhat --network sepolia task:sendProfileBatches
```

This script:
- Encrypts 18 values per pair of profiles
- Sends batch 0 and batch 1 to the deployed contract
- Decrypts each result and compares with the expected premium

---



You’ll see logs like:
```
Sending batch for profile 0 (OBJECT_ID: ABC123)
Batch 0 Result: 8400 — Expected: 8400
All profile premiums matched expected values.
```

---

## Key Files

| File                                             | Purpose |
|--------------------------------------------------|---------|
| `EncryptMultipleValuesProfiles.sol`              | Secure smart contract |
| `tasks/05_EncryptMultipleValuesTaskProfiles.ts`  | Encrypts & submits profiles |
| `test/05_EncryptMultipleValuesTestProfiles.ts`   | Validates encrypted premium logic |
| `deploy/05_deploy_encrypt_multiple_values_profiles.ts` | Deploy script |

---

## Notes

- Works on both localhost and Sepolia
- Profile input comes from `testData/profile5.json`
- Output is matched against `Calculated_Premium` in the JSON
- Supports odd number of profiles (last one is processed solo)
