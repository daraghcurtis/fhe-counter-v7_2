import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { FHEProfileStorage } from "../types";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import hre from "hardhat";

dotenv.config();

describe("FHEProfileStorage multiple profile test", function () {
  this.timeout(300000); // ⏱️ 5 minute timeout for the whole test suite

  let contract: FHEProfileStorage;
  let contractAddress: string;
  let deployer: any;
  let basePremium: number;


  before(async function () {
    [deployer] = await ethers.getSigners();
    await fhevm.initializeCLIApi();

    if (hre.network.name === "sepolia") {
      contractAddress = process.env.SEPOLIA_FHEPROFILE_CONTRACT || "";
      if (!contractAddress) {
        throw new Error("Missing SEPOLIA_FHEPROFILE_CONTRACT in .env");
      }
      contract = await ethers.getContractAt("FHEProfileStorage", contractAddress, deployer);
    } else {
      const factory = await ethers.getContractFactory("FHEProfileStorage");
      contract = (await factory.deploy()) as FHEProfileStorage;
      await contract.waitForDeployment();
      contractAddress = await contract.getAddress();
    }
  });

  it("should correctly calculate premiums for all profiles in profile3.json", async function () {
    const rawData = fs.readFileSync(path.resolve("./testData/profile3.json"), "utf-8");
    const data = JSON.parse(rawData);
    const profiles = data.Profiles;
    basePremium = data.Base_Premium;

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      console.log(`🔁 Testing Profile[${i}] OBJECT_ID: ${profile.OBJECT_ID}`);

      const input = fhevm.createEncryptedInput(contractAddress, deployer.address);
      input.add32(basePremium);

      for (let j = 0; j < 8; j++) {
        input.add32(profile.Factors_Details[j].Rate_Factor_Value);
      }

      const encrypted = await input.encrypt();

      const tx = await contract.connect(deployer).storeProfileAndCalculateWithBase(
        ...encrypted.handles,
        encrypted.inputProof
      );
      await tx.wait();

      const encryptedTotal = await contract.getCount();
      const decryptedTotal = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedTotal,
        contractAddress,
        deployer
      );

      console.log(`   ➜ Expected: ${profile.Calculated_Premium} | Decrypted: ${decryptedTotal}`);
      expect(decryptedTotal).to.equal(profile.Calculated_Premium);
    }
  });
});
