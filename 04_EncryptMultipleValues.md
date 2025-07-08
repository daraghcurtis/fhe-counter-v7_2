
# 🔐 EncryptMultipleValues – Zama FHEVM Testnet Flow

This project demonstrates how to use **Zama's FHEVM** to store and compute over two batches of encrypted values using the `EncryptMultipleValues.sol` smart contract. Each batch contains 9 encrypted `uint32` values, and the contract calculates the sum of each batch using fully homomorphic encryption (FHE).

Encrypted inputs are submitted to a deployed contract (on local or Sepolia testnet), processed and summed privately on-chain, and the resulting encrypted totals are decrypted and verified off-chain.

---

## 📦 Setup

1. **Start the local Hardhat node** (optional):
```bash
npx hardhat node
```

2. **Clean and compile the contracts**:
```bash
npx hardhat clean
npx hardhat compile
```

3. **Deploy the contract locally**:
```bash
npx hardhat --network localhost deploy --tags EncryptMultipleValues
```

---

## 🌍 Sepolia Deployment (Testnet)

1. **Add `.env` file** to root directory:
```
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

2. **Deploy to Sepolia**:
```bash
npx hardhat deploy --network sepolia --tags EncryptMultipleValues
```

After deployment, copy the deployed contract address to use in the next step.

---

## 🚀 Task: Encrypt & Submit Values

To encrypt two batches of 9 values each and submit them to the deployed contract:

```bash
npx hardhat --network sepolia task:sendEncryptedBatches --contract <DEPLOYED_CONTRACT_ADDRESS>
```

This will:
- Encrypt 18 values (two batches)
- Call `initializeBatch0()` and `initializeBatch1()`
- Retrieve and decrypt the sum of each batch from the contract

---

## 🧪 Run Tests (Optional)

### Localhost Test:
```bash
npx hardhat test test/EncryptMultipleValues.ts
```

This test:
- Encrypts 2 batches of 9 values
- Deploys a fresh instance of the contract
- Verifies decryption of values and sums

---

## 📁 Key Files

| File                                           | Purpose |
|------------------------------------------------|---------|
| `EncryptMultipleValues.sol`                    | Confidential smart contract using FHEVM |
| `test/04_EncryptMultipleValues.ts`             | Test script for local runs |
| `tasks/04_EncryptMultipleValuesTask.ts`        | Encrypts & submits two batches on Sepolia |
| `deploy/004_deploy_encrypt_multiple_values.ts` | Deployment script with tag `EncryptMultipleValues` |

---

## 📝 Notes

- Uses Zama's FHEVM mock or real CLI API based on network
- Task and deploy scripts are reusable across environments
- Contract computes encrypted sums in parallel inside each batch
- You can scale to more batches by copying the pattern in the task file
