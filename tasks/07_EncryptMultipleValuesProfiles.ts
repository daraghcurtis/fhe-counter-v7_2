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

task("task:setAllowableCar", "Encrypts and sets allowable car Mapping_ID (533)")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];

    // === Load Deployed ZKP Contract ===
    const zkpDeployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const zkpContract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", zkpDeployed.address, signer);

    // === Encrypt and Send Mapping_ID ===
    const mappingID = 533;
    const mappingInput = fhevm.createEncryptedInput(zkpDeployed.address, signer.address);
    mappingInput.add32(mappingID);
    const encryptedMapping = await mappingInput.encrypt();

    console.log(`Setting allowableCar to Mapping_ID: ${mappingID}`);
    await (await zkpContract.setAllowableCar(
      encryptedMapping.handles[0],
      encryptedMapping.inputProof
    )).wait();

    console.log(`Mapping_ID ${mappingID} stored in contract.`);
  });

task("task:getAllowableCar", "Fetches and decrypts the single allowable car Mapping_ID")
  .setAction(async function (_, hre) {
    const { ethers, deployments, fhevm } = hre;
    const { FhevmType } = require("@fhevm/hardhat-plugin");

    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];
    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const encrypted = await contract.getAllowableCar();
    const decrypted = await fhevm.userDecryptEuint(FhevmType.euint32, encrypted, deployed.address, signer);

    console.log(` Single Allowable Mapping_ID: ${decrypted}`);
  });

task("task:setAllowableCars", "Encrypts and sets an array of allowable car Mapping_IDs")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    const startOverall = Date.now();

    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];
    const zkpDeployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const zkpContract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", zkpDeployed.address, signer);

    // === Mapping_IDs to allow ===
    const mappingIDs = [
      500, 501, 502, 503, 504, 505, 506, 507, 508, 509,
      510, 511, 512, 513, 514, 515, 516, 517, 518, 519,
      520, 521, 522, 523, 524, 525, 526, 527, 528, 529,
      530, 531, 532, 533, 534, 535, 536, 537, 538
    ];

    // === Encrypt array ===
    const input = fhevm.createEncryptedInput(zkpDeployed.address, signer.address);
    mappingIDs.forEach(id => input.add32(id));
    const encrypted = await input.encrypt();

    console.log(` Setting allowableCars to Mapping_IDs: ${mappingIDs.join(", ")}`);

    await (await zkpContract.setAllowableCars(encrypted.handles, encrypted.inputProof)).wait();

    const totalTime = (Date.now() - startOverall) / 1000;
    const avgPerMappingID = totalTime / mappingIDs.length;

    console.log(`Mapping_IDs stored in contract.`);
    console.log(`Total Task Time: ${totalTime.toFixed(2)} sec`);
    console.log(`Number of Mapping_IDs: ${mappingIDs.length}`);
    console.log(`Avg Time per Mapping_ID : ${avgPerMappingID.toFixed(4)} sec`);
  });



task("task:getAllAllowableCars", "Fetches and decrypts all allowable car Mapping_IDs from the contract")
  .setAction(async function (_taskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    const startOverall = Date.now();

    await fhevm.initializeCLIApi();

    const signer = (await ethers.getSigners())[0];
    const zkpDeployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const zkpContract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", zkpDeployed.address, signer);

    const encryptedList = await zkpContract.getAllAllowableCars();

    console.log(`Found ${encryptedList.length} stored Mapping_ID(s):`);

    const startDecrypt = Date.now();
    for (let i = 0; i < encryptedList.length; i++) {
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedList[i],
        zkpDeployed.address,
        signer
      );
      console.log(` Index ${i}: Mapping_ID = ${decrypted}`);
    }
    const endDecrypt = Date.now();

    const totalTime = (Date.now() - startOverall) / 1000;
    const profileTime = (endDecrypt - startDecrypt) / 1000;
    const avgPerProfile = encryptedList.length ? profileTime / encryptedList.length : 0;

    console.log(`\nTotal Task Time: ${totalTime.toFixed(2)} sec`);
    console.log(`Total Profile Processing Time: ${profileTime.toFixed(2)} sec`);
    console.log(`Avg Time per Profile : ${avgPerProfile.toFixed(4)} sec`);
  });



task("task:testAgainstAllAllowableCars", "Sends VEHICLE_MAKE Mapping_ID from each profile and checks against full allowable list")
  .setAction(async function (_, hre) {
    const { ethers, deployments, fhevm } = hre;
    const startOverall = Date.now();

    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];
    const path = require("path");
    const fs = require("fs").promises;
    const { FhevmType } = require("@fhevm/hardhat-plugin");

    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const profilePath = path.join(__dirname, "../testData/profileAll.json");
    const profileJson = JSON.parse(await fs.readFile(profilePath, "utf8"));
    const profiles = profileJson["Profiles"];
    const numProfiles = Math.min(10, profiles.length);

    const startTests = Date.now();
    for (let i = 0; i < numProfiles; i++) {
      const profile = profiles[i];

      const vehicleMakeFactor = profile.Factors_Details.find((f: any) => f.Field_Name === "VEHICLE_MAKE");
      const mappingId = parseInt(vehicleMakeFactor.Mapping_ID);

      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      input.add32(mappingId);
      const encrypted = await input.encrypt();

      console.log(`\nProfile ${i}: Sending VEHICLE_MAKE Mapping_ID: ${mappingId}`);
      await (await contract.testAgainstAllAllowableCars(encrypted.handles[0], encrypted.inputProof)).wait();

      const encryptedResult = await contract.getLastResult();
      const decryptedResult = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedResult, deployed.address, signer);

      console.log(`Decrypted result: ${decryptedResult}`);
      console.log(decryptedResult === 1n ? "MATCH" : "NO MATCH");
    }
    const endTests = Date.now();

    const totalTime = (Date.now() - startOverall) / 1000;
    const profileTime = (endTests - startTests) / 1000;
    const avgPerProfile = profileTime / numProfiles;

    console.log(`\nTotal Task Time: ${totalTime.toFixed(2)} sec`);
    console.log(`Total Profile Processing Time: ${profileTime.toFixed(2)} sec`);
    console.log(`Avg Time per Profile : ${avgPerProfile.toFixed(4)} sec`);
  });




task("task:validateWithFullAllowableList", "Validates car type against list and submits encrypted premiums")
  .setAction(async function (_, hre) {
    const { ethers, deployments, fhevm } = hre;
    const path = require("path");
    const fs = require("fs").promises;
    const { FhevmType } = require("@fhevm/hardhat-plugin");

    const startOverall = Date.now();

    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];
    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const profilePath = path.join(__dirname, "../testData/profileAll.json");
    const profileJson = JSON.parse(await fs.readFile(profilePath, "utf8"));
    const basePremium = parseInt(profileJson["Base_Premium"]);
    const profiles = profileJson["Profiles"];
    const numProfiles = Math.min(10, profiles.length);

    const startCalls = Date.now();
    for (let i = 0; i < numProfiles; i++) {
      const profile = profiles[i];
      const expectedPremium = parseInt(profile.Calculated_Premium);

      const vehicleMakeFactor = profile.Factors_Details.find((f: any) => f.Field_Name === "VEHICLE_MAKE");
      const mappingId = parseInt(vehicleMakeFactor.Mapping_ID);
      console.log(`\nProfile ${i} — VEHICLE_MAKE Mapping_ID: ${mappingId}`);

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

      console.log("VEHICLE_MAKE is allowed — marking as validated...");
      await (await contract.markCarValidated()).wait();

      const values = [
        basePremium,
        ...profile.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value))
      ];

      if (values.length !== 9) {
        console.error(`Invalid number of values (expected 9, got ${values.length}) — skipping`);
        continue;
      }

      console.log("Encrypting premium values:", values);
      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      for (const val of values) input.add32(val);
      const encrypted = await input.encrypt();

      await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();

      const encryptedSum = await contract.getSum0();
      const decryptedSum = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum, deployed.address, signer);

      console.log(`Premium calculated: ${decryptedSum} — Expected: ${expectedPremium}`);
    }

    const endCalls = Date.now();

    const totalTime = (Date.now() - startOverall) / 1000;
    const profileTime = (endCalls - startCalls) / 1000;
    const avgPerProfile = profileTime / numProfiles;

    console.log(`\nTotal Task Time: ${totalTime.toFixed(2)} sec`);
    console.log(`Total Profile Processing Time: ${profileTime.toFixed(2)} sec`);
    console.log(`Avg Time per Profile : ${avgPerProfile.toFixed(4)} sec`);
  });



task("task:sendProfileWithZKPCheck", "Encrypts profile data and compares car Mapping_ID to allowableCar")
  .setAction(async function (_taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];

    // === Load Contracts ===
    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const zkpDeployed = await deployments.get("FHEEncryptedEquality");
    const zkpContract = await ethers.getContractAt("FHEEncryptedEquality", zkpDeployed.address, signer);

    // === Load Profile JSON ===
    const profilePath = path.join(__dirname, "../testData/profileAll.json");
    const profileJson = JSON.parse(await fs.readFile(profilePath, "utf8"));
    const basePremium = parseInt(profileJson["Base_Premium"]);
    const profiles = profileJson["Profiles"];

    for (const profile of profiles) {
      const expectedPremium = parseInt(profile.Calculated_Premium);

      // === Step 1: Extract Mapping_ID for ZKP comparison only ===
      const vehicleMakeFactor = profile.Factors_Details.find((f: any) => f.Field_Name === "VEHICLE_MAKE");
      const mappingID = parseInt(vehicleMakeFactor.Mapping_ID);
      console.log(`\nVEHICLE_MAKE Mapping_ID in Profile: ${mappingID}`);

      // === Step 2: Build array of all encrypted values (Base + 8 Factors) ===
      const values = [
        basePremium,
        ...profile.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value))
      ];

      if (values.length !== 9) {
        console.error(`Invalid number of values (expected 9, got ${values.length})`);
        continue;
      }

      console.log("Profile values being encrypted and sent:");
      console.log("Values:", values);

      // === Step 3: Encrypt and send batch to Premium contract ===
      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      for (const val of values) input.add32(val);
      const encrypted = await input.encrypt();

      console.log(`Sending encrypted premium inputs`);
      await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();

      const encryptedSum = await contract.getSum0();
      const decryptedSum = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum, deployed.address, signer);
      console.log(`Premium: ${decryptedSum} — Expected: ${expectedPremium}`);

      // === Step 4: ZKP Check (Compare Mapping_ID against stored allowable) ===
      const encryptedMappingInput = fhevm.createEncryptedInput(zkpDeployed.address, signer.address);
      encryptedMappingInput.add32(mappingID);
      const encryptedMapping = await encryptedMappingInput.encrypt();

      await (await zkpContract.testSingleValue(encryptedMapping.handles[0], encryptedMapping.inputProof)).wait();

      const encryptedResult = await zkpContract.getLastResult();
      const matchResult = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedResult, zkpDeployed.address, signer);

      console.log(`Vehicle Allowed? ${matchResult === 1n ? "YES" : "NO"}`);
    }
  });

task("task:validateAndSubmitPremiumsFromJson", "Validates car type (one allowed) and submits encrypted premiums")
  .setAction(async function (_, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signer = (await ethers.getSigners())[0];

    // Load contract
    const deployed = await deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    // Load JSON
    const profilePath = path.join(__dirname, "../testData/profileAll.json");
    const profileJson = JSON.parse(await fs.readFile(profilePath, "utf8"));
    const basePremium = parseInt(profileJson["Base_Premium"]);
    const profiles = profileJson["Profiles"];


    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const expectedPremium = parseInt(profile.Calculated_Premium);

      // === Step 1: Extract VEHICLE_MAKE Mapping_ID
      const vehicleMakeFactor = profile.Factors_Details.find((f: any) => f.Field_Name === "VEHICLE_MAKE");
      const mappingId = parseInt(vehicleMakeFactor.Mapping_ID);
      console.log(`\nProfile ${i} — VEHICLE_MAKE Mapping_ID: ${mappingId}`);

      // === Step 2: Encrypt Mapping_ID and send for comparison
      const zkpInput = fhevm.createEncryptedInput(deployed.address, signer.address);
      zkpInput.add32(mappingId);
      const encryptedZKP = await zkpInput.encrypt();

      await (await contract.testSingleValue(encryptedZKP.handles[0], encryptedZKP.inputProof)).wait();

      // === Step 3: Decrypt result
      const encryptedResult = await contract.getLastResult();
      const matchResult = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedResult,
        deployed.address,
        signer
      );

      if (matchResult !== 1n) {
        console.log("VEHICLE_MAKE check failed — skipping profile.");
        continue;
      }

      console.log("VEHICLE_MAKE is allowed — marking as validated...");
      await (await contract.markCarValidated()).wait();

      // === Step 4: Encrypt Premium Inputs
      const values = [
        basePremium,
        ...profile.Factors_Details.map((f: any) => parseInt(f.Rate_Factor_Value))
      ];

      if (values.length !== 9) {
        console.error(`Invalid number of values (expected 9, got ${values.length}) — skipping`);
        continue;
      }

      console.log("Encrypting premium values:", values);
      const input = fhevm.createEncryptedInput(deployed.address, signer.address);
      for (const val of values) input.add32(val);
      const encrypted = await input.encrypt();

      await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();

      const encryptedSum = await contract.getSum0();
      const decryptedSum = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum, deployed.address, signer);

      console.log(`Premium calculated: ${decryptedSum} — Expected: ${expectedPremium}`);
    }
  });

task("task:getLastInput", "Decrypts the last encrypted Mapping_ID passed to testSingleValue")
  .setAction(async function (_, hre) {

    await hre.fhevm.initializeCLIApi();
    const signer = (await hre.ethers.getSigners())[0];

    const deployed = await hre.deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await hre.ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const encrypted = await contract.getLastInput();


    const decrypted = await hre.fhevm.userDecryptEuint(hre.FhevmType.euint32, encrypted, deployed.address, signer);

    console.log(`Mapping_ID that was just compared: ${decrypted}`);
  });

task("task:getLastResult", "Decrypts result of last Mapping_ID comparison")
  .setAction(async function (_, hre) {
    await hre.fhevm.initializeCLIApi();
    const signer = (await hre.ethers.getSigners())[0];

    const deployed = await hre.deployments.get("EncryptMultipleValuesProfiles07");
    const contract = await hre.ethers.getContractAt("EncryptMultipleValuesProfiles07", deployed.address, signer);

    const encrypted = await contract.getLastResult();
    const decrypted = await hre.fhevm.userDecryptEuint(hre.FhevmType.euint32, encrypted, deployed.address, signer);

    console.log(`Comparison result: ${decrypted} — ${decrypted === 1n ? "MATCH" : "NO MATCH"}`);
  });