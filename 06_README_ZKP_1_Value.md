# FHEEncryptedEquality Quick Start

- Compares one ZKP against another ZKP to ensure the encryptred values are equal
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

3. Deploy the FHEEncryptedEquality contract:
```bash
npx hardhat deploy --tags FHEEncryptedEquality --network localhost
```

---

## Run Tasks

1. Encrypt and store `allowableCar = 533`:
```bash
npx hardhat task:encryptAllowableCar --network localhost
```

2. Compare with second encrypted value:
```bash
npx hardhat task:zkpTestOne --network localhost
```

---

## Run Tests

```bash
npx hardhat test test/06_ZKP_1_Value_Test.ts --network localhost
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
npx hardhat clean
npx hardhat compile
npx hardhat deploy --tags FHEEncryptedEquality --network sepolia
```

3. Run tasks and tests:
```bash
npx hardhat task:encryptAllowableCar --network sepolia
npx hardhat task:zkpTestOne --network sepolia
npx hardhat test test/06_ZKP_1_Value_Test.ts --network sepolia
```

---

- Contract: `FHEEncryptedEquality.sol`
- Task script: `06_ZKP_1_Value_Task.ts`
- Test file: `06_ZKP_1_Value_Test.ts`
