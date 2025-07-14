# EncryptMultipleValuesProfiles07 Quick Start

- Loops through all profiles in the json document
- encrypts all the rating factors including the allowable cars and base premium
- Checks if the allowable cars are in the list of allowable cars
- Calculates premiums and checks if they are correct
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

3. Deploy the EncryptMultipleValuesProfiles07 contract:
```bash
npx hardhat --network localhost deploy --tags EncryptMultipleValuesProfiles07
```

4. Run the test suite:
```bash
npx hardhat test test/07_EncryptMultipleValuesTests.ts --network localhost
```

---

## Run Tasks

### One-by-One Mapping_ID Check

```bash
npx hardhat task:setAllowableCar --network localhost
npx hardhat task:getAllowableCar --network localhost
npx hardhat task:checkAllCarsFromJson --network localhost
npx hardhat task:validateAndSubmitPremiumsFromJson --network localhost
```

### Array-Based Mapping_ID Checks

```bash
npx hardhat task:setAllowableCars --network localhost
npx hardhat task:getAllAllowableCars --network localhost
npx hardhat task:testAgainstAllAllowableCars --network localhost
npx hardhat task:validateWithFullAllowableList --network localhost
```

---

- Contract: `EncryptMultipleValuesProfiles07.sol`
- Test file: `test/07_EncryptMultipleValuesTests.ts`
