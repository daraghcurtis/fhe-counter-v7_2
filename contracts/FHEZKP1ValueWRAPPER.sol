// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./FHEZKP1Value.sol";

contract FHEZKP1ValueWRAPPER {
    FHEZKP1Value public core;

    event Batch0Processed(bool success);
    event Batch1Processed(bool success);

    constructor(address _core) {
        core = FHEZKP1Value(_core);
    }

    function safeInitializeBatch0(
        externalEuint32[9] calldata inputs,
        externalEuint32 zkpAllowedMappingID,
        externalEuint32 zkpMappingIdA,
        bytes calldata inputProof
    ) external {
        try core.initializeBatch0(inputs, zkpAllowedMappingID, zkpMappingIdA, inputProof) {
            emit Batch0Processed(true);
        } catch {
            emit Batch0Processed(false);
        }
    }

    function safeInitializeBatch1(
        externalEuint32[9] calldata inputs,
        externalEuint32 zkpMappingIdA,
        externalEuint32 zkpMappingIdB,
        bytes calldata inputProof
    ) external {
        try core.initializeBatch1(inputs, zkpMappingIdA, zkpMappingIdB, inputProof) {
            emit Batch1Processed(true);
        } catch {
            emit Batch1Processed(false);
        }
    }
}
