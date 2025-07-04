# FHECounterMulti Quick Start

This project demonstrates how to use Zama's FHEVM to perform confidential additions using encrypted inputs. It supports multi-value encryption (3 inputs summed together) and secure decryption of the final result.

---

## 🚀 Setup

1. Start the local Hardhat node in a separate terminal:

```bash
npx hardhat node
```
1B. SANITY TEST
```bash
npx hardhat test
```

2. Deploy the multi-value FHE counter contract:

```bash
npx hardhat --network localhost deploy --tags FHECounterMulti
```

---

## 🔐 Usage

### ➕ Increment using 3 encrypted values

```bash
npx hardhat --network localhost task:increment --value1 1 --value2 2 --value3 3
```

This securely encrypts and adds 1 + 2 + 3 to the counter.

---

### 🔓 Decrypt the current encrypted count

```bash
npx hardhat --network localhost task:decrypt-count
```

This decrypts and prints the clear count value.

---

## ✅ Example Output

```bash
FHECounterMulti increment(1+2+3) succeeded!
Encrypted count: 0xa9d1...690400
Clear count    : 6
```

---

## 🛠 Notes

- If you restart the node, you must redeploy:
  ```bash
  npx hardhat --network localhost deploy --tags FHECounterMulti
  ```

- Contract used: `FHECounterMulti`