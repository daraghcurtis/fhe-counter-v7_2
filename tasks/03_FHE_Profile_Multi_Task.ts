// scripts/04_FHE_Profile_5_Task.ts

import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";


task("task:calculatePremiumsBatch", "Encrypts multiple profiles and sends them to FHEProfileBatchStorage")
  .addParam("contract", "Address of the deployed FHEProfileBatchStorage contract")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("FHEProfileBatchStorage", taskArguments.contract, signer);

    const filePath = path.resolve("./testData/profile5.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const profiles = JSON.parse(rawData);

    const profileBatchHandles: string[][] = [];
    const profileProofs: string[] = [];
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];

      const input = fhevm.createEncryptedInput(taskArguments.contract, signer.address);
      input.add32(profile.Calculated_Premium);
      for (let j = 0; j < 8; j++) {
        input.add32(profile.Factors_Details[j].Rate_Factor_Value);
      }

      const encrypted = await input.encrypt();

      const stringHandles = encrypted.handles.map((h) => Buffer.from(h).toString("hex"));
      const stringProof = Buffer.from(encrypted.inputProof).toString("hex");

      profileBatchHandles.push(stringHandles);
      profileProofs.push(stringProof);
    }


    console.log(`Submitting ${profileBatchHandles.length} encrypted profiles in one transaction...`);

    const tx = await contract.storeBatchProfilesAndCalculateWithBase(profileBatchHandles, profileProofs);
    await tx.wait();

    console.log("Batch transaction complete");
  });
