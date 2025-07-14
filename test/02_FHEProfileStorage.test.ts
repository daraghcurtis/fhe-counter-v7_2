import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { FHEProfileStorage } from "../types";
import * as fs from "fs";
import * as path from "path";

describe("FHEProfileStorage with base premium", function () {
  let contract: FHEProfileStorage;
  let contractAddress: string;
  let deployer: any;

  before(async function () {
    [deployer] = await ethers.getSigners();

    if (!fhevm.isMock) {
      throw new Error("This test suite must run on the local FHEVM mock environment.");
    }

    const factory = await ethers.getContractFactory("FHEProfileStorage");
    contract = (await factory.deploy()) as FHEProfileStorage;
    contractAddress = await contract.getAddress();
  });

  it("should correctly calculate premium using encrypted base + rate factors", async function () {
    const profilePath = path.resolve("./testData/profile1.json");
    const rawData = fs.readFileSync(profilePath, "utf-8");
    const json = JSON.parse(rawData);
    const profile = json.Profiles[0];
    const basePremium = json.Base_Premium;

    const encrypted = await fhevm
      .createEncryptedInput(contractAddress, deployer.address)
      .add32(basePremium)
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
      .connect(deployer)
      .storeProfileAndCalculateWithBase(
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.handles[2],
        encrypted.handles[3],
        encrypted.handles[4],
        encrypted.handles[5],
        encrypted.handles[6],
        encrypted.handles[7],
        encrypted.handles[8], // base premium
        encrypted.inputProof
      );
    await tx.wait();

    const encryptedCount = await contract.getCount();
    const clearCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      contractAddress,
      deployer
    );

    console.log(` Encrypted Count: ${encryptedCount}`);
    console.log(`Clear Count     : ${clearCount}`);
    console.log(`📊 Expected Premium: ${profile.Calculated_Premium}`);
    expect(clearCount).to.equal(profile.Calculated_Premium);
  });
});
