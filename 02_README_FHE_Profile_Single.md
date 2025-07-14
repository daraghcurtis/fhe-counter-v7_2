# FHEProfileStorage Quick Start

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

3. Deploy the FHEProfileStorage contract:
```bash
npx hardhat --network localhost deploy --tags FHEProfileStorage
```

4. Run the test suite:
```bash
npx hardhat test test/02_FHEProfileStorage.test.ts
```

---

## Usage

### Encrypt and Upload a Profile

Encrypt the profile JSON file and submit the data to the FHEProfileStorage contract:

```bash
npx hardhat --network localhost task:calculatePremium
```

This task encrypts the rate factor values from the profile and sends them to the contract for private summation.

---

- Contract: `FHEProfileStorage.sol`
- Profile input file: `testData/profile1.json`
- Task script: `02_FHE_Profile_Single_Task.ts`
