import { expect } from "chai";
import hre, { deployments, ethers } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import * as dotenv from "dotenv";

dotenv.config();

describe("FHEEncryptedEquality - ZKP 1 Value Test", function () {
  this.timeout(300000);

  let contractAddress: string;
  let signer: any;

  before(async function () {
    const { deployer } = await hre.getNamedAccounts();
    signer = await ethers.getSigner(deployer);
    await hre.fhevm.initializeCLIApi();

    if (hre.network.name === "sepolia") {
      contractAddress = process.env.SEPOLIA_FHEPROFILE_CONTRACT || "";
      if (!contractAddress) {
        throw new Error("Missing SEPOLIA_FHEPROFILE_CONTRACT in .env");
      }
    } else {
      await deployments.fixture(); // fresh deploy
      const deployed = await deployments.get("FHEEncryptedEquality");
      contractAddress = deployed.address;
    }
  });

  it("should store allowableCar = 533 and match it with a test value of 533", async function () {
    const contract = await ethers.getContractAt("FHEEncryptedEquality", contractAddress, signer);

    // Step 1: Set allowableCar = 533
    const allowableCar = 533;
    const input1 = await hre.fhevm.createEncryptedInput(contractAddress, signer.address);
    input1.add32(allowableCar);
    const encrypted1 = await input1.encrypt();
    await (await contract.setAllowableCar(encrypted1.handles[0], encrypted1.inputProof)).wait();

    // Step 2: Test value = 533 → should match
    const input2 = await hre.fhevm.createEncryptedInput(contractAddress, signer.address);
    input2.add32(533);
    const encrypted2 = await input2.encrypt();
    await (await contract.testSingleValue(encrypted2.handles[0], encrypted2.inputProof)).wait();

    const encryptedResult1 = await contract.getLastResult();
    const result1 = await hre.fhevm.userDecryptEuint(FhevmType.euint32, encryptedResult1, contractAddress, signer);

    console.log("Test match with 533 =>", result1);
    expect(result1).to.equal(1n);
  });

  it("should NOT match allowableCar = 533 when test value is 534", async function () {
    const contract = await ethers.getContractAt("FHEEncryptedEquality", contractAddress, signer);

    // Step 3: Test value = 534 → should NOT match
    const input3 = await hre.fhevm.createEncryptedInput(contractAddress, signer.address);
    input3.add32(534);
    const encrypted3 = await input3.encrypt();
    await (await contract.testSingleValue(encrypted3.handles[0], encrypted3.inputProof)).wait();

    const encryptedResult2 = await contract.getLastResult();
    const result2 = await hre.fhevm.userDecryptEuint(FhevmType.euint32, encryptedResult2, contractAddress, signer);

    console.log("Test non-match with 534 =>", result2);
    expect(result2).to.equal(0n);
  });
});