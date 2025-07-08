# 🔐 FHEProfileStorage (Multi Profile) – Zama FHEVM Testnet Flow

This project demonstrates how to use **Zama's FHEVM** to store and compute over encrypted insurance profile data — but now supports **multiple profiles**, each with up to 8 encrypted rate factors and a base premium.

Encrypted inputs are submitted to a deployed contract (on local or Sepolia testnet), summed privately on-chain, and the resulting premium is decrypted and verified.

---

## Setup

1. **Start the local Hardhat node** in a separate terminal:
```bash
npx hardhat node
```

2. **Clean and compile** the contract:
```bash
npx hardhat clean
npx hardhat compile
```

3. **Deploy the contract locally**:
```bash
npx hardhat --network localhost deploy --tags FHEMULTIProfileStorage
```

---

## Sepolia Deployment (Testnet)

1. **Set your `.env` file** with:

```
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_FHEPROFILE_CONTRACT=0xYourDeployedSepoliaAddress
```

2. **Deploy to Sepolia**:
```bash
npx hardhat deploy --network sepolia --tags FHEMULTIProfileStorage
```

---

## Run Tests

### Local Test:

```bash
npx hardhat test test/03_FHE_Profile_Multi_3.test.ts
```

### Sepolia Test:

```bash
npx hardhat test test/03_FHE_Profile_Multi_3.test.ts --network sepolia
```

Each profile in `testData/profile3.json` is:
- Encrypted using the Relayer SDK
- Submitted to the smart contract
- Calculated on-chain
- Decrypted and verified against `Calculated_Premium`

---

## Key Files

| File | Purpose |
|------|---------|
| `FHEProfileStorage.sol` | Confidential smart contract |
| `test/03_FHE_Profile_Multi_3.test.ts` | Main test file (supports Sepolia & localhost) |
| `testData/profile3.json` | Multiple profiles to be processed |
| `.env` | Holds Sepolia contract address and API keys |

---

## Notes

- Tests automatically use `.env` on Sepolia
- Falls back to local deployment if `--network sepolia` not passed
- Modify `testData/profile3.json` to test new profiles