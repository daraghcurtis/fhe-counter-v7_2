import type { TaskArguments } from "hardhat/types";
import { task } from "hardhat/config";
import { promises as fs } from "fs";
import path from "path";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("task:zkpTestOne", "Encrypts 533, sends to contract, compares with encrypted value")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
      const { ethers, deployments, fhevm } = hre;
      await fhevm.initializeCLIApi();

      const signer = (await ethers.getSigners())[0];
      const deployed = await deployments.get("FHEEncryptedEquality");
      const contract = await ethers.getContractAt("FHEEncryptedEquality", deployed.address, signer);

      const value = 533;
      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      input.add32(value);
      const encrypted = await input.encrypt();

      console.log("📤 Sending encrypted value:", value);
      const tx = await contract.testSingleValue(encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      const encryptedResult = await contract.getLastResult();
      const decryptedResult = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedResult,
        deployed.address,
        signer
      );

      console.log("🔎 Decrypted result:", decryptedResult);
        console.log(decryptedResult === 1n ? "✅ MATCH" : "❌ NO MATCH");
  });

task("task:encryptAllowableCar", "Encrypts the allowableCar value (533) for future use")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
        const { ethers, deployments, fhevm } = hre;
        await fhevm.initializeCLIApi();

        const signer = (await ethers.getSigners())[0];
        const deployed = await deployments.get("FHEEncryptedEquality");
        const contract = await ethers.getContractAt("FHEEncryptedEquality", deployed.address, signer);

        const allowableCar = 533;
        const input = fhevm.createEncryptedInput(deployed.address, signer.address);
        input.add32(allowableCar);
        const encrypted = await input.encrypt();

        console.log("🚗 Encrypted allowableCar value:", allowableCar);
        console.log("🔐 Encrypted handle:", encrypted.handles[0]);
        console.log("🧾 Proof size:", encrypted.inputProof.length);

        const tx = await contract.setAllowableCar(encrypted.handles[0], encrypted.inputProof);
        await tx.wait();
        console.log("📬 Sent to setAllowableCar()");
  });
