// --- Strictly Conforming FHEProfileStorage.ts ---

import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

/**
 * Example:
 *   npx hardhat --network localhost task:calculatePremium
 */
task("task:calculatePremium", "Encrypts profile rate factors and calls FHEProfileStorage")
  .addOptionalParam("address", "Optionally specify the FHEProfileStorage contract address")
  .addOptionalParam("file", "Path to profile JSON", "./testData/profile1.json")
  .addOptionalParam("index", "Which profile index to use from the array", "0")
  .setAction(async function (taskArguments: TaskArguments, hre) {
      const { ethers, deployments, fhevm } = hre;

      const profileIndex = parseInt(taskArguments.index);
      const profilePath = path.resolve(taskArguments.file);
      const rawData = fs.readFileSync(profilePath, "utf-8");
      const profiles = JSON.parse(rawData);
      const profile = profiles[profileIndex];

      if (!profile || profile.Factors_Details.length < 8) {
          throw new Error(`Profile index ${profileIndex} is invalid or missing 8 factors`);
      }

      await fhevm.initializeCLIApi();

      const deployment = taskArguments.address
        ? { address: taskArguments.address }
        : await deployments.get("FHEProfileStorage");
      console.log(`FHEProfileStorage: ${deployment.address}`);

      const signers = await ethers.getSigners();
      const contract = await ethers.getContractAt("FHEProfileStorage", deployment.address);

      const encrypted = await fhevm
        .createEncryptedInput(deployment.address, signers[0].address)
        .add32(profile.Factors_Details[0].Rate_Factor_Value)
        .add32(profile.Factors_Details[1].Rate_Factor_Value)
        .add32(profile.Factors_Details[2].Rate_Factor_Value)
        .add32(profile.Factors_Details[3].Rate_Factor_Value)
        .add32(profile.Factors_Details[4].Rate_Factor_Value)
        .add32(profile.Factors_Details[5].Rate_Factor_Value)
        .add32(profile.Factors_Details[6].Rate_Factor_Value)
        .add32(profile.Factors_Details[7].Rate_Factor_Value)
        .encrypt();

      const tx = await contract
        .connect(signers[0])
        .storeProfileAndCalculate(
          encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3],
          encrypted.handles[4], encrypted.handles[5], encrypted.handles[6], encrypted.handles[7],
          encrypted.inputProof
        );

      console.log(`Wait for tx:${tx.hash}...`);
      const receipt = await tx.wait();
      console.log(`tx:${tx.hash} status=${receipt?.status}`);

      const encryptedCount = await contract.getCount();
      const clearCount = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedCount,
        deployment.address,
        signers[0]
      );

      console.log(`Encrypted Count: ${encryptedCount}`);
      console.log(`Clear Count     : ${clearCount}`);
      console.log(`Expected Premium: ${profile.Calculated_Premium}`);
  });
