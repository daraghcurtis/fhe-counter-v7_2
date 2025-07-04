// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE counter contract with multi-value increment support
contract FHECounterMulti is SepoliaConfig {
    euint32 private _count;

    /// @notice Returns the current count
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increments the counter by a specified encrypted value.
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.add(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value.
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.sub(_count, encryptedEuint32);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Increments the counter by the sum of 3 encrypted values.
    function incrementMulti(
        externalEuint32 input1,
        externalEuint32 input2,
        externalEuint32 input3,
        bytes calldata inputProof
    ) external {
        euint32 val1 = FHE.fromExternal(input1, inputProof);
        euint32 val2 = FHE.fromExternal(input2, inputProof);
        euint32 val3 = FHE.fromExternal(input3, inputProof);

        euint32 total = FHE.add(FHE.add(val1, val2), val3);
        _count = FHE.add(_count, total);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
