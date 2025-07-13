import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFHEZKP1Value: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("EncryptMultipleValuesProfiles07", {
    from: deployer,
    log: true,
    args: [],
  });
};

deployFHEZKP1Value.tags = ["EncryptMultipleValuesProfiles07"];

export default deployFHEZKP1Value;
