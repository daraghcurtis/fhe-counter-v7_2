# FHECounterMulti Quick Start
Basic OOB Project from ZAMA - demonstrates how to use FHEVM to perform confidential additions using encrypted inputs. 
Multi-value encryption (3 inputs summed together) and secure decryption of the final result.

---

## Setup

1. Start Hardhat node in a separate terminal:

```bash
npx hardhat node
```
1B. SANITY TEST (New window)
```bash
npx hardhat test test/01_FHECounterMulti.test.ts
```

2. Deploy the multi-value FHE counter contract:

```bash
npx hardhat --network localhost deploy --tags FHECounterMulti
```

---

##  Usage

### Increment using 3 encrypted values

```bash
npx hardhat --network localhost task:increment --value1 1 --value2 2 --value3 3
```

---

### Decrypt the current encrypted count

```bash
npx hardhat --network localhost task:decrypt-count
```

Decrypts and prints the clear count value.

---

- Contract used: `FHECounterMulti`