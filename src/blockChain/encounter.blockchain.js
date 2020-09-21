// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const encounterMasterBlockChain = () => {
    const _createEncounterMasterBlockChain = async (encounterObject) => {
        const encounterCreateUrl = await emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.ENCOUNTER_CREATE}`;
        const encounterCreateObjects = emr_utility
            .postRequest(encounterCreateUrl, { Authorization: TOKEN },
                {
                    Id: encounterObject,
                    CreatedOn: encounterObject,
                    CreatedBy: encounterObject,
                    IsDelete: false,
                    Patient_id: encounterObject,
                    Encounter_type: encounterObject,
                    Encounter_identifier: encounterObject,
                    Facility_uuid: encounterObject,
                    Department_uuid: encounterObject,
                    Encounter_date: encounterObject,
                    Doctor_uuid: encounterObject,
                    Admission_uuid: encounterObject,
                    Discharge_type_uuid: encounterObject,
                    Discharge_date: encounterObject,
                    Death_type_uuid: encounterObject,
                    Death_date: encounterObject
                }
            );
        return encounterCreateObjects;
    };
    return {
        createEncounterMasterBlockChain: _createEncounterMasterBlockChain
    };
};


module.exports = encounterMasterBlockChain();