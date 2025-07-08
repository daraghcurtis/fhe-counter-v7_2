import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHECounterMulti = await deploy("FHECounterMulti", {
    from: deployer,
    log: true,
  });

  console.log(`FHECounterMulti contract: `, deployedFHECounterMulti.address);
};
export default func;
func.id = "deploy_fheCounterMulti"; // id required to prevent reexecution
func.tags = ["FHECounterMulti"];
