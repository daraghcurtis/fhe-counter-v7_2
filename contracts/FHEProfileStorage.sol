// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHEProfileStorage: Sums encrypted rate factors from an insurance profile
contract FHEProfileStorage is SepoliaConfig {
    euint32 private _premiumTotal;

    /// @notice Returns the encrypted premium total
    function getCount() external view returns (euint32) {
        return _premiumTotal;
    }

    /// @notice Accepts 8 encrypted rate factor values and computes the confidential premium total
    function storeProfileAndCalculate(
        externalEuint32 sex,
        externalEuint32 effectiveYear,
        externalEuint32 productionYear,
        externalEuint32 numberOfSeats,
        externalEuint32 carryingCapacity,
        externalEuint32 vehicleType,
        externalEuint32 vehicleMake,
        externalEuint32 vehicleUsage,
        bytes calldata inputProof
    ) external {
        // Decrypt each input using the shared Zama input proof
        euint32 encSex = FHE.fromExternal(sex, inputProof);
        euint32 encEffectiveYear = FHE.fromExternal(effectiveYear, inputProof);
        euint32 encProductionYear = FHE.fromExternal(productionYear, inputProof);
        euint32 encNumSeats = FHE.fromExternal(numberOfSeats, inputProof);
        euint32 encCarryingCapacity = FHE.fromExternal(carryingCapacity, inputProof);
        euint32 encVehicleType = FHE.fromExternal(vehicleType, inputProof);
        euint32 encVehicleMake = FHE.fromExternal(vehicleMake, inputProof);
        euint32 encVehicleUsage = FHE.fromExternal(vehicleUsage, inputProof);

        // Sum the 8 values in grouped additions to reduce nesting
        euint32 total = FHE.add(
            FHE.add(FHE.add(encSex, encEffectiveYear), FHE.add(encProductionYear, encNumSeats)),
            FHE.add(FHE.add(encCarryingCapacity, encVehicleType), FHE.add(encVehicleMake, encVehicleUsage))
        );

        _premiumTotal = total;

        // Allow this contract and the caller to access the final encrypted value
        FHE.allowThis(_premiumTotal);
        FHE.allow(_premiumTotal, msg.sender);
    }
}
