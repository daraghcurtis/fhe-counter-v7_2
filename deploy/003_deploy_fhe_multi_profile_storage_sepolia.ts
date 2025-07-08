import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

// DEPLOY :
// npx hardhat deploy --network sepolia --tags FHEMULTIProfileStorage

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  console.log(`Deploying FHEMULTIProfileStorage to network: ${network.name}`);

  const result = await deploy("FHEProfileStorage", {
    from: deployer,
    log: true,
  });

  console.log(`Contract deployed at: ${result.address}`);
};

export default deploy;
deploy.tags = ["FHEMULTIProfileStorage"];
