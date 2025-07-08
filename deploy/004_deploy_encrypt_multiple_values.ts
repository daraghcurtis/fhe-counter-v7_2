import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployEncryptMultipleValues: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("EncryptMultipleValues", {
    from: deployer,
    log: true,
    args: [],
  });
};

deployEncryptMultipleValues.tags = ["EncryptMultipleValues"];

export default deployEncryptMultipleValues;
