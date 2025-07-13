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

contract FHEZKP1Value is SepoliaConfig {
    // Debug Events
    event DebugStep(string step);
    event DebugMappingRaw(euint32 allowed, euint32 actual, euint32 guard);
    event DebugMappingBatch1Raw(euint32 a, euint32 b, euint32 guard);
    event DebugSingle(euint32 value);



    // Storage
    euint32[9] private batch0;
    euint32[9] private batch1;

    euint32 private sum;
    euint32 private sum1;

    function initializeBatch0(
        externalEuint32[9] calldata inputs,
        externalEuint32 zkpAllowedMappingID,
        externalEuint32 zkpMappingIdA,
        bytes calldata inputProof
    ) external {
        // ZKP VALIDATION (select returns 1 if match, else 0)
        euint32 allowed = FHE.fromExternal(zkpAllowedMappingID, inputProof);
        euint32 actual = FHE.fromExternal(zkpMappingIdA, inputProof);
        ebool isEqual = FHE.eq(allowed, actual);
        euint32 guard = FHE.select(isEqual, FHE.asEuint32(1), FHE.asEuint32(0));

        emit DebugMappingRaw(allowed, actual, guard); // Emits encrypted MappingID check inputs

        // Load encrypted inputs
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
        sum = FHE.mul(sum, guard); // Apply ZKP gate

        FHE.allowThis(sum);
        FHE.allow(sum, msg.sender);
    }

    function initializeBatch1(
        externalEuint32[9] calldata inputs,
        externalEuint32 zkpMappingIdA,
        externalEuint32 zkpMappingIdB,
        bytes calldata inputProof
    ) external {
        // ZKP VALIDATION (select returns 1 if match, else 0)
        euint32 a = FHE.fromExternal(zkpMappingIdA, inputProof);
        euint32 b = FHE.fromExternal(zkpMappingIdB, inputProof);
        ebool isEqual = FHE.eq(a, b);
        euint32 guard = FHE.select(isEqual, FHE.asEuint32(1), FHE.asEuint32(0));

        emit DebugMappingBatch1Raw(a, b, guard); // Emits encrypted MappingID equality check

        // Load encrypted inputs
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
        sum1 = FHE.mul(sum1, guard); // Apply ZKP gate

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

    // === Test Single Input ===
    function testSingleValue(externalEuint32 val, bytes calldata proof) public {
        emit DebugStep("entered testSingleValue");
    }

}
