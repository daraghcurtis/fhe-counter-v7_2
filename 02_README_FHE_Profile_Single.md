# FHEProfileStorage Quick Start

This project demonstrates how to use Zama's FHEVM to securely store and compute over encrypted insurance profile data. Each profile includes multiple encrypted rate factors, which are summed privately on-chain to calculate a total premium.

---

## 🚀 Setup

1. Start the local Hardhat node in a separate terminal:

```bash
npx hardhat node
```

2. Clean required files and compile the smart contract:
```bash
npx hardhat clean
npx hardhat compile
```

3. Deploy the `FHEProfileStorage` contract to the local Hardhat network:
```bash
npx hardhat --network localhost deploy --tags FHEProfileStorage
```

4. Run test cases to ensure everything is set up correctly:
```bash
npx hardhat test
```



## 🔐 Usage

### 📦 Encrypt and Upload a Profile (Manually Task)

Encrypt a profile JSON file (e.g., `test_data/profile1.json`) and send it to the FHEProfileStorage contract:

```bash
npx hardhat --network localhost task:calculatePremium
```

This encrypts multiple `Rate_Factor_Value`s from the profile and submits them to the contract for confidential summing.

---

## 🛠 Notes

- If you restart the node, you must redeploy the contract:

```bash
npx hardhat --network localhost deploy --tags FHEProfileStorage
```

- Contract: `FHEProfileStorage.sol`
- Profile source file: `testData/profile1.json`
- Main task file: `02_FHE_Profile_Single_Task.ts`
