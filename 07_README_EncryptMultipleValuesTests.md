# ZKP Profile Validation – EncryptMultipleValuesProfiles07

This module processes insurance profiles with encrypted premium data and validates the vehicle make against an approved list using FHE and ZKP.

## One-by-One Mapping_ID Check (Single Value)

This mode checks one Mapping_ID per profile against a single allowed value.

```bash
npx hardhat compile
npx hardhat --network localhost deploy --tags EncryptMultipleValuesProfiles07
npx hardhat task:setAllowableCar --network localhost
npx hardhat task:getAllowableCar --network localhost
npx hardhat task:checkAllCarsFromJson --network localhost
npx hardhat task:validateAndSubmitPremiumsFromJson --network localhost
```

## Array-Based Mapping_ID Checks

This mode encrypts and stores an array of allowed Mapping_IDs, checking profile values against the array.

```bash
npx hardhat compile
npx hardhat --network localhost deploy --tags EncryptMultipleValuesProfiles07
npx hardhat task:setAllowableCars --network localhost
npx hardhat task:getAllAllowableCars --network localhost
npx hardhat task:testAgainstAllAllowableCars --network localhost
npx hardhat task:validateWithFullAllowableList --network localhost
```

## Running the ZKP Profile Validation Tests

```bash
npx hardhat test test/07_EncryptMultipleValuesTests.ts --network localhost
```

Tests included:
- Calculate and validate encrypted premiums (full profile validation)
- Decrypt and verify stored allowable Mapping_IDs
- A-Z test of encrypting and decrypting set values

## Contracts
- EncryptMultipleValuesProfiles07.sol (ZKP contract supporting arrays of Mapping_IDs)