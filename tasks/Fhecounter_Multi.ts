// --- Strictly Conforming FHECounterMulti.ts for Multi-Value Encryption ---

import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Multi-value increment:
 *   npx hardhat --network localhost task:increment --value1 1 --value2 2 --value3 3
 */
task("task:increment", "Calls the increment() function of FHECounterMulti Contract")
  .addOptionalParam("address", "Optionally specify the FHECounterMulti contract address")
  .addParam("value1", "The first value")
  .addParam("value2", "The second value")
  .addParam("value3", "The third value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
      const { ethers, deployments, fhevm } = hre;

      const value1 = parseInt(taskArguments.value1);
      const value2 = parseInt(taskArguments.value2);
      const value3 = parseInt(taskArguments.value3);

      if (![value1, value2, value3].every(Number.isInteger)) {
          throw new Error(`All --valueX arguments must be integers`);
      }

      await fhevm.initializeCLIApi();

      const FHECounterDeployment = taskArguments.address
        ? { address: taskArguments.address }
        : await deployments.get("FHECounterMulti");
      console.log(`FHECounterMulti: ${FHECounterDeployment.address}`);

      const signers = await ethers.getSigners();
      const fheCounterContract = await ethers.getContractAt("FHECounterMulti", FHECounterDeployment.address);

      const encrypted = await fhevm
        .createEncryptedInput(FHECounterDeployment.address, signers[0].address)
        .add32(value1)
        .add32(value2)
        .add32(value3)
        .encrypt();

      const tx = await fheCounterContract
        .connect(signers[0])
        .incrementMulti(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.inputProof);
      console.log(`Wait for tx:${tx.hash}...`);

      const receipt = await tx.wait();
      console.log(`tx:${tx.hash} status=${receipt?.status}`);

      const newEncryptedCount = await fheCounterContract.getCount();
      console.log("Encrypted count after increment:", newEncryptedCount);

      console.log(`FHECounterMulti increment(${value1}+${value2}+${value3}) succeeded!`);
  });

task("task:decrypt-count", "Calls the getCount() function of FHECounterMulti Contract")
  .addOptionalParam("address", "Optionally specify the Counter contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
      const { ethers, deployments, fhevm } = hre;

      await fhevm.initializeCLIApi();

      const FHECounterDeployment = taskArguments.address
        ? { address: taskArguments.address }
        : await deployments.get("FHECounterMulti");
      console.log(`FHECounterMulti: ${FHECounterDeployment.address}`);

      const signers = await ethers.getSigners();
      const fheCounterContract = await ethers.getContractAt("FHECounterMulti", FHECounterDeployment.address);

      const encryptedCount = await fheCounterContract.getCount();
      if (encryptedCount === ethers.ZeroHash) {
          console.log(`encrypted count: ${encryptedCount}`);
          console.log("clear count    : 0");
          return;
      }

      const clearCount = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedCount,
        FHECounterDeployment.address,
        signers[0],
      );
      console.log(`Encrypted count: ${encryptedCount}`);
      console.log(`Clear count    : ${clearCount}`);
  });
