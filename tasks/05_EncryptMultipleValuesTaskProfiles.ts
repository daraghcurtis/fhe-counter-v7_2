// 05_EncryptMultipleValuesTask.ts

import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import { promises as fs } from "fs";
import path from "path";
import type { TaskArguments } from "hardhat/types";

/**
 * Run with:
 *   npx hardhat --network localhost task:sendProfileBatches
 */

task("task:sendProfileBatches", "Encrypts batches from profile5.json and sends them to EncryptMultipleValuesProfiles")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const signer = (await ethers.getSigners())[0];
    const deployed = await deployments.get("EncryptMultipleValuesProfiles");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles", deployed.address, signer);

    const profilePath = path.join(__dirname, "../testData/profile5.json");
    const profileJson = JSON.parse(await fs.readFile(profilePath, "utf8"));
    const basePremium = parseInt(profileJson["Base_Premium"]);
    const profiles = profileJson["Profiles"];

    for (let i = 0; i < profiles.length; i += 2) {
      const profileA = profiles[i];
      const profileB = profiles[i + 1];

      const expectedPremiumA = parseInt(profileA.Calculated_Premium);
      const expectedPremiumB = profileB ? parseInt(profileB.Calculated_Premium) : null;

      const valuesA = [
        basePremium,
        ...profileA.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value))
      ];
      const valuesB = profileB ? [
        basePremium,
        ...profileB.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value))
      ] : [];

      if (valuesA.length !== 9 || (profileB && valuesB.length !== 9)) {
        console.error(`One of the profiles at index ${i} has invalid number of values.`);
        continue;
      }

      const input = fhevm.createEncryptedInput(deployed.address, signer.address);

      for (const val of valuesA) input.add32(val);
      for (const val of valuesB) input.add32(val);

      const encrypted = await input.encrypt();

      console.log(`\u2728 Sending batch ${i} (profile ${i})...`);
      await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();

      if (profileB) {
        console.log(`\u2728 Sending batch ${i + 1} (profile ${i + 1})...`);
        await (await contract.initializeBatch1(encrypted.handles.slice(9, 18), encrypted.inputProof)).wait();
      }

      const encryptedSum0 = await contract.getSum0();
      const decrypted0 = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum0, deployed.address, signer);
      const result0 = Number(decrypted0);
      const match0 = result0 === expectedPremiumA;
      console.log(`\ud83d\udcc8 Decrypted sum (batch 0): ${result0} — Expected ${expectedPremiumA} | ${match0 ? "MATCH" : "MISMATCH"}`);

      if (profileB) {
        const encryptedSum1 = await contract.getSum1();
        const decrypted1 = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum1, deployed.address, signer);
        const result1 = Number(decrypted1);
        const match1 = result1 === expectedPremiumB;
        console.log(`\ud83d\udcc8 Decrypted sum (batch 1): ${result1} — Expected ${expectedPremiumB} | ${match1 ? "MATCH" : "MISMATCH"}`);
      }
    }

    console.log("\u2705 Done sending all batches.");
  });
