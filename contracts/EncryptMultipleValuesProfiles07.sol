// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {
FHE,
externalEuint32,
euint32
} from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptMultipleValuesProfiles07 is SepoliaConfig {
    euint32[9] private batch0;
    euint32[9] private batch1;

    euint32 private sum;
    euint32 private sum1;

    // Replacing the car checking logic with working version:
    euint32 private allowableCar;
    euint32[] private allowableCars;
    euint32 private _lastResult;

    event EncryptedValuesCompared(
        bytes32 encryptedInputHandle,
        bytes32 storedHandle,
        bytes32 resultHandle
    );

    // === SET ALLOWABLE CAR  ===
    function setAllowableCar(externalEuint32 input, bytes calldata proof) external {
        allowableCar = FHE.fromExternal(input, proof);
        FHE.allowThis(allowableCar);
        FHE.allow(allowableCar, msg.sender);
    }

    // === GET ALLOWABLE CAR ===
    function getAllowableCar() public view returns (euint32) {
        return allowableCar;
    }

    // === SET ALLOWABLE CARS  ===
    function setAllowableCars(externalEuint32[] calldata inputs, bytes calldata proof) external {
        delete allowableCars; // Clear existing list (optional — remove if you want to append)
        for (uint i = 0; i < inputs.length; i++) {
            euint32 val = FHE.fromExternal(inputs[i], proof);
            FHE.allowThis(val);
            FHE.allow(val, msg.sender);
            allowableCars.push(val);
        }
    }

    // === GET ALLOWABLE CARS ===
    function getAllAllowableCars() public view returns (euint32[] memory) {
        return allowableCars;
    }

    // === COMPARE AGAINST ALLOWABLE CAR  ===
    function testSingleValue(externalEuint32 input, bytes calldata proof) external {
        euint32 encryptedInput = FHE.fromExternal(input, proof);

        _lastResult = FHE.select(
            FHE.eq(encryptedInput, allowableCar),
            FHE.asEuint32(1),
            FHE.asEuint32(0)
        );

        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);
    }

    // === COMPARE AGAINST ALL ALLOWABLE CARS  ===
    function testAgainstAllAllowableCars(externalEuint32 input, bytes calldata proof) external {
        euint32 encryptedInput = FHE.fromExternal(input, proof);
        euint32 result = FHE.asEuint32(0);

        for (uint i = 0; i < allowableCars.length; i++) {
            result = FHE.select(
                FHE.eq(encryptedInput, allowableCars[i]),
                FHE.asEuint32(1),
                result
            );
        }

        _lastResult = result;

        FHE.allowThis(_lastResult);
        FHE.allow(_lastResult, msg.sender);
    }


    // === COMPARE AGAINST ALLOWABLE CARS ARRAY ===
    function getLastResult() public view returns (euint32) {
        return _lastResult;
    }

    // === Premium Calculation Logic ===

    function initializeBatch0(
        externalEuint32[9] calldata inputs,
        bytes calldata inputProof
    ) external onlyIfCarValid  {
        for (uint i = 0; i < 9; i++) {
            batch0[i] = FHE.fromExternal(inputs[i], inputProof);
            FHE.allowThis(batch0[i]);
            FHE.allow(batch0[i], msg.sender);
        }

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
    ) external onlyIfCarValid  {
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

    function getSum0() public view returns (euint32) {
        return sum;
    }

    function getSum1() public view returns (euint32) {
        return sum1;
    }

    function getBatch0Val(uint i) public view returns (euint32) {
        require(i < 9, "Index out of bounds");
        return batch0[i];
    }

    function getBatch1Val(uint i) public view returns (euint32) {
        require(i < 9, "Index out of bounds");
        return batch1[i];
    }

    mapping(address => bool) private carValidated;


    modifier onlyIfCarValid() {
        require(carValidated[msg.sender], "VEHICLE_MAKE not allowed");
        _;
    }

    function markCarValidated() external {
        carValidated[msg.sender] = true;
    }

}
