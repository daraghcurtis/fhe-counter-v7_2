import { task } from "hardhat/config";
import { FhevmType } from "@fhevm/hardhat-plugin";
import fs from "fs";

task("calculatePremium", "Encrypts profile and sends to contract")
  .addParam("contract", "Contract address")
  .addParam("profile", "Path to JSON file for a single insurance profile")
  .setAction(async ({ contract, profile }, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const profileData = JSON.parse(fs.readFileSync(profile, "utf8"));

    const contractInstance = await hre.ethers.getContractAt("FHEProfile5Storage", contract);
    const factors = profileData.Profiles[0].Factors_Details.map((f: any) => f.Rate_Factor_Value);

    const input = await fhevm
      .createEncryptedInput(contract, signer.address);

    for (const f of factors) {
      input.add32(Math.floor(f)); // truncate float → int for euint32
    }

    const encrypted = await input.encrypt();

    const tx = await contractInstance
      .connect(signer)
      .calculatePremium(encrypted.handles, encrypted.inputProof);

    await tx.wait();
    console.log("Encrypted premium submitted.");
  });
