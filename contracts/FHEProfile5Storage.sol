// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
FHE,
euint32,
externalEuint32
} from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEProfile5Storage is SepoliaConfig {
    euint32 private _premium;

    function calculatePremium(
        externalEuint32[] calldata encryptedRateFactors,
        bytes calldata inputProof
    ) external {
        require(encryptedRateFactors.length > 0, "No rate factors provided");

        euint32 total = FHE.fromExternal(encryptedRateFactors[0], inputProof);

        for (uint256 i = 1; i < encryptedRateFactors.length; i++) {
            euint32 factor = FHE.fromExternal(encryptedRateFactors[i], inputProof);
            total = FHE.add(total, factor);
        }

        _premium = total;

        FHE.allowThis(_premium);
        FHE.allow(_premium, msg.sender);
    }

    function getEncryptedPremium() external view returns (euint32) {
        return _premium;
    }
}
