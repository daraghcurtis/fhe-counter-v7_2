// task:sendProfileWithZKPCheck.ts
import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import { promises as fs } from "fs";
import path from "path";
import type { TaskArguments } from "hardhat/types";


task("task:checkAllCarsFromJson", "Sends VEHICLE_MAKE Mapping_ID from each profile and checks match")
  .setAction(async function (_, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];
    const path = require("path");
    const fs = require("fs").promises;
    const { FhevmType } = require("@fhevm/hardhat-plugin");

    // Load contract
    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    // Load JSON
    const profilePath = path.join(__dirname, "../testData/profileAll.json");
    const profileJson = JSON.parse(await fs.readFile(profilePath, "utf8"));
    const profiles = profileJson["Profiles"];

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];

      // Dynamically extract VEHICLE_MAKE Mapping_ID for this profile
      const vehicleMakeFactor = profile.Factors_Details.find((f: any) => f.Field_Name === "VEHICLE_MAKE");
      const mappingId = parseInt(vehicleMakeFactor.Mapping_ID);

      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      input.add32(mappingId);
      const encrypted = await input.encrypt();

      console.log(`\nProfile ${i}: Sending VEHICLE_MAKE Mapping_ID: ${mappingId}`);
      await (await contract.testSingleValue(encrypted.handles[0], encrypted.inputProof)).wait();

      const encryptedResult = await contract.getLastResult();
      const decryptedResult = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedResult, deployed.address, signer);

      console.log(`Decrypted result: ${decryptedResult}`);
      console.log(decryptedResult === 1n ? "MATCH" : "FAILED");
    }
  });


import { expect } from "chai";
describe("FHE Profile Validation Test", function () {
  let deployed: any;
  let contract: any;
  let signer: any;

  before(async () => {
    const hre: any = require("hardhat");
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    signer = (await ethers.getSigners())[0];
    deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const mappingIDs = [533, 534, 535];
    const input = fhevm.createEncryptedInput(deployed.address, signer.address);
    mappingIDs.forEach(id => input.add32(id));
    const encrypted = await input.encrypt();
    await (await contract.setAllowableCars(encrypted.handles, encrypted.inputProof)).wait();
  });

  it("should calculate premium and validate vehicle match", async function () {
    const hre: any = require("hardhat");
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];

    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const profilePath = path.join(__dirname, "../testData/profileAll.json");
    const profileJson = JSON.parse(await fs.readFile(profilePath, "utf8"));
    const basePremium = parseInt(profileJson["Base_Premium"]);
    const profiles = profileJson["Profiles"];

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const expectedPremium = parseInt(profile.Calculated_Premium);

      const vehicleMakeFactor = profile.Factors_Details.find((f: any) => f.Field_Name === "VEHICLE_MAKE");
      const mappingId = parseInt(vehicleMakeFactor.Mapping_ID);

      const zkpInput = fhevm.createEncryptedInput(deployed.address, signer.address);
      zkpInput.add32(mappingId);
      const encryptedZKP = await zkpInput.encrypt();

      await (await contract.testAgainstAllAllowableCars(encryptedZKP.handles[0], encryptedZKP.inputProof)).wait();
      const encryptedResult = await contract.getLastResult();
      const matchResult = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedResult, deployed.address, signer);

      if (matchResult !== 1n) {
        console.log("VEHICLE_MAKE check failed — skipping profile.");
        continue;
      }

      await (await contract.markCarValidated()).wait();

      const values = [
        basePremium,
        ...profile.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value))
      ];

      if (values.length !== 9) {
        console.error(`Invalid number of values (expected 9, got ${values.length}) — skipping`);
        continue;
      }

      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      for (const val of values) input.add32(val);
      const encrypted = await input.encrypt();

      await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();
      const encryptedSum = await contract.getSum0();
      const decryptedSum = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum, deployed.address, signer);

      expect(decryptedSum).to.equal(BigInt(expectedPremium));
    }
  });

  it("should fetch and decrypt all allowable Mapping_IDs", async function () {
    const hre: any = require("hardhat");
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];

    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const encryptedList = await contract.getAllAllowableCars();
    expect(encryptedList.length).to.be.greaterThan(0);

    for (let i = 0; i < encryptedList.length; i++) {
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedList[i],
        deployed.address,
        signer
      );
      expect(decrypted).to.be.a("bigint");
    }
  });

  it("should store and retrieve the correct allowable Mapping_IDs", async function () {
    const hre: any = require("hardhat");
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];

    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const mappingIDs = [533, 534, 535];
    const input = fhevm.createEncryptedInput(deployed.address, signer.address);
    mappingIDs.forEach(id => input.add32(id));
    const encrypted = await input.encrypt();

    await (await contract.setAllowableCars(encrypted.handles, encrypted.inputProof)).wait();

    const encryptedList = await contract.getAllAllowableCars();
    for (let i = 0; i < encryptedList.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const decrypted = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedList[i], deployed.address, signer);
      expect(mappingIDs).to.include(Number(decrypted));
    }
  });
});
