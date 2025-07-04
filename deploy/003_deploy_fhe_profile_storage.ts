// deploy/002_deploy_fhe_profile_storage.ts

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

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
