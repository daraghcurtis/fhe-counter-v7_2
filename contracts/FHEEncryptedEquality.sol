// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEEncryptedEquality is SepoliaConfig {
    euint32 private allowableCar;
    euint32 private _lastResult;

    event EncryptedValuesCompared(
        bytes32 encryptedInputHandle,
        bytes32 storedHandle,
        bytes32 resultHandle
    );

    // Step 1: Receive and store the encrypted allowableCar
    function setAllowableCar(externalEuint32 input, bytes calldata proof) external {
        allowableCar = FHE.fromExternal(input, proof);
        FHE.allowThis(allowableCar);
        FHE.allow(allowableCar, msg.sender);
    }

    // Step 2: Compare incoming encrypted value against stored allowableCar
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



    function getLastResult() public view returns (euint32) {
        return _lastResult;
    }
}
