// deploy/002_deploy_fhe_profile_storage.ts

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deployment Guide for FHEProfileStorage
 *
 * 1. Compile contracts (always recommended before deploying):
 *      npx hardhat compile
 *
 * 2. Deploy the FHEProfileStorage contract:
 *      npx hardhat deploy --tags FHEProfileStorage
 *
 * 3. To FORCE a new deployment (ignores previous deployments):
 *      npx hardhat deploy --tags FHEProfileStorage --reset
 *
 * Requirements:
 * - Ensure your Hardhat network is configured (see hardhat.config.ts).
 * - Set up required environment variables (e.g., private keys, RPC URLs).
 * - Install dependencies: npm install
 *
 * This script will log the deployed contract address to the console.
 */

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHEProfileStorage = await deploy("FHEProfileStorage", {
    from: deployer,
    log: true,
  });

  console.log(`FHEProfileStorage contract:`, deployedFHEProfileStorage.address);
};

export default func;
func.id = "deploy_fheProfileStorage"; // prevents reexecution
func.tags = ["FHEProfileStorage"];
