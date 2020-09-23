// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');
const utilityService = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const encounterMasterBlockChain = () => {
    const _createEncounterBlockChain = async (encounterObject, encounterDoctorObject) => {
        const encounterCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.ENCOUNTER_CREATE}`;
        const encounterCreateObjects = emr_utility
            .postRequest(encounterCreateUrl, { Authorization: TOKEN },
                {
                    Id: encounterObject.uuid,
                    CreatedOn: encounterObject.created_date,
                    CreatedBy: encounterObject.created_by,
                    IsDelete: false,
                    Patient_id: encounterObject.patient_uuid,
                    Encounter_type: encounterObject.encounter_type_uuid,
                    Encounter_identifier: encounterObject.encounter_identifier,
                    Facility_uuid: encounterObject.facility_uuid,
                    Department_uuid: encounterObject.department_uuid,
                    Encounter_date: encounterObject.encounter_date,
                    Doctor_uuid: encounterDoctorObject.doctor_uuid,
                    Admission_uuid: encounterObject.admission_uuid,
                    Discharge_type_uuid: encounterObject.discharge_type_uuid,
                    Discharge_date: encounterObject.created_date,
                    Death_type_uuid: "encounterObject",
                    Death_date: encounterObject.created_date
                }
            );
        return encounterCreateObjects;
    };

    const _deleteEncounterBlockChain = async (Id) => {
        const encounterDeleteURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.ENCOUNTER_DELETE}`;
        return await utilityService.deleteRequest(encounterDeleteURL, { Authorization: TOKEN }, { Id });
    };
    return {
        createEncounterBlockChain: _createEncounterBlockChain,
        deleteEncounterBlockChain: _deleteEncounterBlockChain
    };
};


module.exports = encounterMasterBlockChain();