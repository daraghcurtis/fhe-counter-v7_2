// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {
FHE,
externalEbool,
externalEuint32,
externalEaddress,
ebool,
euint32,
eaddress
} from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptMultipleValuesProfiles is SepoliaConfig {
    euint32[9] private batch0;
    euint32[9] private batch1;

    euint32 private sum;
    euint32 private sum1;

    function initializeBatch0(
        externalEuint32[9] calldata inputs,
        bytes calldata inputProof
    ) external {
        for (uint i = 0; i < 9; i++) {
            batch0[i] = FHE.fromExternal(inputs[i], inputProof);
            FHE.allowThis(batch0[i]);
            FHE.allow(batch0[i], msg.sender);
        }

        // batch0[0] = basePremium
        euint32 tempSum = batch0[1];
        for (uint i = 2; i < 9; i++) {
            tempSum = FHE.add(tempSum, batch0[i]);
        }

        euint32 one = FHE.asEuint32(1);
        euint32 total = FHE.add(one, tempSum);
        sum = FHE.mul(batch0[0], total);

        FHE.allowThis(sum);
        FHE.allow(sum, msg.sender);
    }

    function initializeBatch1(
        externalEuint32[9] calldata inputs,
        bytes calldata inputProof
    ) external {
        for (uint i = 0; i < 9; i++) {
            batch1[i] = FHE.fromExternal(inputs[i], inputProof);
            FHE.allowThis(batch1[i]);
            FHE.allow(batch1[i], msg.sender);
        }

        euint32 tempSum = batch1[1];
        for (uint i = 2; i < 9; i++) {
            tempSum = FHE.add(tempSum, batch1[i]);
        }

        euint32 one = FHE.asEuint32(1);
        euint32 total = FHE.add(one, tempSum);
        sum1 = FHE.mul(batch1[0], total);

        FHE.allowThis(sum1);
        FHE.allow(sum1, msg.sender);
    }

    // === SUM GETTERS ===
    function getSum0() public view returns (euint32) {
        return sum;
    }

    function getSum1() public view returns (euint32) {
        return sum1;
    }

    // === VALUE GETTERS ===
    function getBatch0Val(uint i) public view returns (euint32) {
        require(i < 9, "Index out of bounds");
        return batch0[i];
    }

    function getBatch1Val(uint i) public view returns (euint32) {
        require(i < 9, "Index out of bounds");
        return batch1[i];
    }
}
