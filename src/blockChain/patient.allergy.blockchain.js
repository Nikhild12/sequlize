// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const PatientAllergyBlockChain = () => {

    const _createPatientAllergyBlockchain = async (object) => {
        const allergyCreateURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.ALLERGY_CREATE}`;
        const create = {
            Id: object.uuid,
            CreatedOn: object.created_date,
            CreatedBy: object.created_by,
            IsDelete: false,
            Patient_id: object.patient_uuid,
            Encounter_id: object.encounter_uuid,
            Allergy_master_uuid: object.allergy_master_uuid,
            Allergy_master_code: "AM",
            Allergy_master_name: "AM",
            Allergy_type_uuid: object.allergy_type_uuid,
            Allergy_source_uuid: object.allergy_source_uuid,
            Allergy_severity_uuid: object.allergy_severity_uuid,
            Duration: object.duration,
            Allergy_reactions: object.allergy_reactions,
            Allergy_status_uuid: "AS",
            Start_date: object.created_date,
            End_date: object.created_date
        };

        return emr_utility
            .postRequest(allergyCreateURL, { Authorization: TOKEN }, create);
    };

    const _deletePatientAllergyBlockChain = async (Id) => {
        const allergyDeleteURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.ALLERGY_DELETE}`;
        return await emr_utility.deleteRequest(allergyDeleteURL, TOKEN, { Id });
    };

    const _getPatientAllergyBlockChain = async (Id) => {
        const allergyGetURL = `${emr_utility.deployedBlockChainUrl()}${BLOCK_CHAIN_URL.ALLERGY_GET}/${Id}`;
        return await emr_utility.getBlockChainRequest(allergyGetURL, TOKEN);
    };

    const _queryStringPatientAllergyBlockChain = async (queryStringObject) => {
        let patientAllergyCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.ALLERGY_QUERY_STRING}`;
        return await emr_utility.postRequest(patientAllergyCreateUrl, { Authorization: TOKEN }, { "selector": queryStringObject });
    };

    return {
        createPatientAllergyBlockchain: _createPatientAllergyBlockchain,
        getPatientAllergyBlockChain: _getPatientAllergyBlockChain,
        deletePatientAllergyBlockChain: _deletePatientAllergyBlockChain,
        queryStringPatientAllergyBlockChain: _queryStringPatientAllergyBlockChain
    };
};

module.exports = PatientAllergyBlockChain();