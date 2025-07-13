# 🔐 ZKP 1 Value Match – FHEEncryptedEquality (Zama FHEVM)

This project demonstrates a confidential comparison between two encrypted values using Zama’s FHEVM. It shows how to:

- Encrypt a value off-chain (`allowableCar = 533`) and store it in a smart contract
- Encrypt a second value and send it for comparison
- Decrypt the result to verify if the values matched — all without revealing any plaintext on-chain

---

## 📦 Setup

Start from a clean build and compile the project:

```bash
npx hardhat clean
npx hardhat compile
```

---

## 🌍 Deploy to localhost

Deploy only the tagged `FHEEncryptedEquality` contract:

```bash
npx hardhat deploy --tags FHEEncryptedEquality --network localhost
```

---

## 🧪 Run Tasks

1. **Encrypt and store `allowableCar = 533`:**

```bash
npx hardhat task:encryptAllowableCar --network localhost
```

2. **Send a second encrypted value (also 533) and compare it against the stored one:**

```bash
npx hardhat task:zkpTestOne --network localhost
```

---

## 🧪 Run Tests

Run the test file to validate both matching and non-matching values:

```bash
npx hardhat test test/06_ZKP_1_Value_Test.ts --network localhost
```

---

## ✅ Expected Output

The test logs should show:

```
✅ Test match with 533 => 1n
❌ Test non-match with 534 => 0n
```

---

## 📁 Key Files

| File                             | Purpose                                 |
|----------------------------------|-----------------------------------------|
| `FHEEncryptedEquality.sol`       | Smart contract for encrypted comparison |
| `06_ZKP_1_Value_Task.ts`         | Encrypts, sends, and compares values    |
| `06_ZKP_1_Value_Test.ts`         | Unit test for match and non-match cases |
---

## 🌐 Deploy & Test on Sepolia Network

To test the contract on Sepolia instead of localhost:

```bash
npx hardhat clean
npx hardhat compile
npx hardhat deploy --tags FHEEncryptedEquality --network sepolia
npx hardhat task:encryptAllowableCar --network sepolia
npx hardhat task:zkpTestOne --network sepolia
npx hardhat test test/06_ZKP_1_Value_Test.ts --network sepolia
```

Ensure your `.env` includes the deployed contract address:

```env
SEPOLIA_FHEPROFILE_CONTRACT=0x2A5a981b6f1B45E7bbC79A77a42EE836F9fE2fD8
```
