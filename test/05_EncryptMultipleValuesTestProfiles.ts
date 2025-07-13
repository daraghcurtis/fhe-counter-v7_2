// 05_EncryptMultipleValuesTestProfiles.ts

import { ethers } from "hardhat";
import { expect } from "chai";
import profileJson from "../testData/profile5.json";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("EncryptMultipleValuesProfiles full flow", function () {
  it("correctly computes and verifies premiums from profile5.json", async function () {
    const signer = (await ethers.getSigners())[0];
    const deployed = await hre.deployments.get("EncryptMultipleValuesProfiles");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles", deployed.address, signer);

    const fhevm = hre.fhevm;
    await fhevm.initializeCLIApi();

    const basePremium = parseInt(profileJson.Base_Premium);
    const profiles = profileJson.Profiles;

    for (let i = 0; i < profiles.length; i += 2) {
      const profileA = profiles[i];
      const profileB = profiles[i + 1];

      const expectedA = parseInt(profileA.Calculated_Premium);
      const expectedB = profileB ? parseInt(profileB.Calculated_Premium) : null;

      const valuesA = [
        basePremium,
        ...profileA.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value)),
      ];
      const valuesB = profileB
        ? [basePremium, ...profileB.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value))]
        : [];

      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      for (const v of valuesA) input.add32(v);
      for (const v of valuesB) input.add32(v);

      const encrypted = await input.encrypt();

      console.log(`\nSending batch for profile ${i} (OBJECT_ID: ${profileA.OBJECT_ID})`);
      await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();
      const encryptedSum0 = await contract.getSum0();
      const result0 = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum0, deployed.address, signer);
      console.log(`Batch 0 Result: ${Number(result0)} — Expected: ${expectedA}`);
      expect(Number(result0)).to.equal(expectedA);

      if (profileB) {
        console.log(`\nSending batch for profile ${i + 1} (OBJECT_ID: ${profileB.OBJECT_ID})`);
        await (await contract.initializeBatch1(encrypted.handles.slice(9, 18), encrypted.inputProof)).wait();
        const encryptedSum1 = await contract.getSum1();
        const result1 = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum1, deployed.address, signer);
        console.log(`Batch 1 Result: ${Number(result1)} — Expected: ${expectedB}`);
        expect(Number(result1)).to.equal(expectedB);
      }
    }

    console.log("\nAll profile premiums matched expected values.");
  });
});
