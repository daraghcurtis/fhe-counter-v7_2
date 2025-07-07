// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHEProfileStorage: Calculates confidential insurance premium
contract FHEProfileStorage is SepoliaConfig {
    euint32 private _basePremium;
    euint32 private _calculatedPremium;

    /// @notice Set the encrypted base premium
    function setBasePremium(externalEuint32 encryptedBasePremium, bytes calldata proof) external {
        _basePremium = FHE.fromExternal(encryptedBasePremium, proof);
    }

    /// @notice Returns the encrypted calculated premium
    function getCount() external view returns (euint32) {
        return _calculatedPremium;
    }

    /// @notice Accepts 8 encrypted rate factor values and computes the confidential premium
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
        euint32 encSex = FHE.fromExternal(sex, inputProof);
        euint32 encEffectiveYear = FHE.fromExternal(effectiveYear, inputProof);
        euint32 encProductionYear = FHE.fromExternal(productionYear, inputProof);
        euint32 encNumSeats = FHE.fromExternal(numberOfSeats, inputProof);
        euint32 encCarryingCapacity = FHE.fromExternal(carryingCapacity, inputProof);
        euint32 encVehicleType = FHE.fromExternal(vehicleType, inputProof);
        euint32 encVehicleMake = FHE.fromExternal(vehicleMake, inputProof);
        euint32 encVehicleUsage = FHE.fromExternal(vehicleUsage, inputProof);

        euint32 sum = FHE.add(
            FHE.add(FHE.add(encSex, encEffectiveYear), FHE.add(encProductionYear, encNumSeats)),
            FHE.add(FHE.add(encCarryingCapacity, encVehicleType), FHE.add(encVehicleMake, encVehicleUsage))
        );

        euint32 one = FHE.asEuint32(1);
        euint32 total = FHE.add(one, sum);

        _calculatedPremium = FHE.mul(_basePremium, total);

        FHE.allowThis(_calculatedPremium);
        FHE.allow(_calculatedPremium, msg.sender);
    }

    /// @notice Accepts base premium and 8 encrypted rate factor values in one call, all with the same proof
    function storeProfileAndCalculateWithBase(
        externalEuint32 encryptedBasePremium,
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
        euint32 basePremium = FHE.fromExternal(encryptedBasePremium, inputProof);
        euint32 encSex = FHE.fromExternal(sex, inputProof);
        euint32 encEffectiveYear = FHE.fromExternal(effectiveYear, inputProof);
        euint32 encProductionYear = FHE.fromExternal(productionYear, inputProof);
        euint32 encNumSeats = FHE.fromExternal(numberOfSeats, inputProof);
        euint32 encCarryingCapacity = FHE.fromExternal(carryingCapacity, inputProof);
        euint32 encVehicleType = FHE.fromExternal(vehicleType, inputProof);
        euint32 encVehicleMake = FHE.fromExternal(vehicleMake, inputProof);
        euint32 encVehicleUsage = FHE.fromExternal(vehicleUsage, inputProof);

        euint32 sum = FHE.add(
            FHE.add(FHE.add(encSex, encEffectiveYear), FHE.add(encProductionYear, encNumSeats)),
            FHE.add(FHE.add(encCarryingCapacity, encVehicleType), FHE.add(encVehicleMake, encVehicleUsage))
        );

        euint32 one = FHE.asEuint32(1);
        euint32 total = FHE.add(one, sum);

        _calculatedPremium = FHE.mul(basePremium, total);

        FHE.allowThis(_calculatedPremium);
        FHE.allow(_calculatedPremium, msg.sender);
    }
}