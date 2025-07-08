// tasks/EncryptMultipleValuesTask.ts

import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Run with:
 *   npx hardhat --network sepolia task:sendEncryptedBatches --contract <deployedAddress>
 */

task("task:sendEncryptedBatches", "" +
  "Encrypts two batches of values and sends them to EncryptMultipleValues")
  .addParam("contract", "Address of deployed EncryptMultipleValues contract")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const signer = (await ethers.getSigners())[0];
    const contract = await ethers.getContractAt("EncryptMultipleValues", taskArguments.contract, signer);

    const input = fhevm.createEncryptedInput(taskArguments.contract, signer.address);

    // === Batch 0 ===
    input.add32(101);
    input.add32(202);
    input.add32(303);
    input.add32(404);
    input.add32(505);
    input.add32(606);
    input.add32(707);
    input.add32(808);
    input.add32(909);

    // === Batch 1 ===
    input.add32(1);
    input.add32(2);
    input.add32(3);
    input.add32(4);
    input.add32(5);
    input.add32(6);
    input.add32(7);
    input.add32(8);
    input.add32(9);

    const encrypted = await input.encrypt();

    console.log("\u2728 Sending batch 0...");
    await (await contract.initializeBatch0(encrypted.handles.slice(0, 9), encrypted.inputProof)).wait();

    console.log("\u2728 Sending batch 1...");
    await (await contract.initializeBatch1(encrypted.handles.slice(9, 18), encrypted.inputProof)).wait();

    console.log("\u2705 Done sending both batches.");

    const encryptedSum0 = await contract.getSum0();
    const encryptedSum1 = await contract.getSum1();

    const decrypted0 = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum0, taskArguments.contract, signer);
    const decrypted1 = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedSum1, taskArguments.contract, signer);

    console.log("\ud83d\udcc8 Decrypted sum (batch 0):", Number(decrypted0));
    console.log("\ud83d\udcc8 Decrypted sum (batch 1):", Number(decrypted1));
  });
