import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { EncryptMultipleValues } from "../../../types";
import * as dotenv from "dotenv";

dotenv.config();

describe("EncryptMultipleValues", function () {
  this.timeout(300000); // ✅ 5 min timeout for Sepolia

  let contract: EncryptMultipleValues;
  let contractAddress: string;
  let signer: any;

  before(async function () {
    [signer] = await ethers.getSigners();
    await fhevm.initializeCLIApi();

    if (hre.network.name === "sepolia") {
      contractAddress = process.env.SEPOLIA_ENCRYPT_CONTRACT || "";
      if (!contractAddress) {
        throw new Error("Missing SEPOLIA_ENCRYPT_CONTRACT in .env");
      }
      contract = await ethers.getContractAt("EncryptMultipleValues", contractAddress, signer);
    } else {
      const factory = await ethers.getContractFactory("EncryptMultipleValues");
      contract = (await factory.deploy()) as EncryptMultipleValues;
      await contract.waitForDeployment();
      contractAddress = await contract.getAddress();
    }
  });

  it("should encrypt, send, and decrypt two batches of 9 values", async function () {
    const input = fhevm.createEncryptedInput(contractAddress, signer.address);

    const batch0 = [101, 202, 303, 404, 505, 606, 707, 808, 909];
    const batch1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const all = [...batch0, ...batch1];

    all.forEach(val => input.add32(val));
    const encrypted = await input.encrypt();

    await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();
    await (await contract.initializeBatch1(encrypted.handles.slice(9, 18), encrypted.inputProof)).wait();

    const encSum0 = await contract.getSum0();
    const encSum1 = await contract.getSum1();

    const dec0 = await fhevm.userDecryptEuint(FhevmType.euint32, encSum0, contractAddress, signer);
    const dec1 = await fhevm.userDecryptEuint(FhevmType.euint32, encSum1, contractAddress, signer);

    console.log("📦 Decrypted sum (batch 0):", Number(dec0));
    console.log("📦 Decrypted sum (batch 1):", Number(dec1));
  });
});
