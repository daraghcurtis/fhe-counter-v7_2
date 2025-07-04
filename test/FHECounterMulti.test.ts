import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { FHECounterMulti, FHECounterMulti__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHECounterMulti")) as FHECounterMulti__factory;
  const fheCounterContract = (await factory.deploy()) as FHECounterMulti;
  const fheCounterContractAddress = await fheCounterContract.getAddress();

  return { fheCounterContract, fheCounterContractAddress };
}

describe("FHECounterMulti", function () {
  let signers: Signers;
  let fheCounterContract: FHECounterMulti;
  let fheCounterContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1] };
  });

  beforeEach(async () => {
    if (!fhevm.isMock) {
      throw new Error("This test must run on a local FHEVM mock environment");
    }
    ({ fheCounterContract, fheCounterContractAddress } = await deployFixture());
  });

  it("should return ZeroHash on fresh deploy", async function () {
    const encrypted = await fheCounterContract.getCount();
    expect(encrypted).to.eq(ethers.ZeroHash);
  });

  it("should correctly encrypt 1, 2, 3 and result in 6", async function () {
    const value1 = 1;
    const value2 = 2;
    const value3 = 3;

    const encryptedInput = await fhevm
      .createEncryptedInput(fheCounterContractAddress, signers.alice.address)
      .add32(value1)
      .add32(value2)
      .add32(value3)
      .encrypt();

    const tx = await fheCounterContract
      .connect(signers.alice)
      .incrementMulti(
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.handles[2],
        encryptedInput.inputProof
      );
    await tx.wait();

    const encryptedAfter = await fheCounterContract.getCount();
    const decrypted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedAfter,
      fheCounterContractAddress,
      signers.alice
    );

    console.log(`Decrypted result: ${decrypted}`);

    expect(value1).to.eq(1);
    expect(value2).to.eq(2);
    expect(value3).to.eq(3);
    expect(decrypted).to.eq(value1 + value2 + value3);
    expect(decrypted).to.eq(6);
  });
});