// deploy/05_deploy_encrypt_multiple_values_profiles.ts

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployEncryptMultipleValuesProfiles: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("EncryptMultipleValuesProfiles", {
    from: deployer,
    log: true,
    args: [],
  });
};

deployEncryptMultipleValuesProfiles.tags = ["EncryptMultipleValuesProfiles"];

export default deployEncryptMultipleValuesProfiles;
