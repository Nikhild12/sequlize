// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const diagnosisMasterBlockChain = () => {
    const _createDiagnosisMasterBlockChain = async (diagnosisObject) => {
        const diagnosisCreateUrl = await emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.DIAGNOSIS_CREATE}`;
        const diagnosisCreateObjects = diagnosisObject.map((dO) => {
            return emr_utility
                .postRequest(diagnosisCreateUrl, { Authorization: TOKEN },
                    {
                        Id: dO.uuid,
                        CreatedOn: dO.created_date,
                        CreatedBy: dO.created_by,
                        IsDelete: false,
                        Patient_id: dO.patient_uuid,
                        Encounter_id: dO.encounter_uuid,
                        Diagnosis_type: "dO",
                        Diagnosis_uuid: dO.diagnosis_uuid,
                        Diagnosis_code: "dO",
                        Diagnosis_name: "dO",
                        Is_chronic: dO.is_snomed,
                        Diagnosis_date: dO.created_date,
                        Other_diagnosis_details: dO,
                        Bodysite: dO.body_site_uuid
                    });
        });
        return await Promise.all(diagnosisCreateObjects);
    };

    const _deleteDiagnosisBlockChain = async (Id) => {
        const diagnosisDeleteURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.DIAGNOSIS_DELETE}`;
        return await emr_utility.deleteRequest(diagnosisDeleteURL, TOKEN, { Id });
    };

    const _getDiagnosisBlockChain = async (Id) => {
        const historyGetURL = `${emr_utility.deployedBlockChainUrl()}${BLOCK_CHAIN_URL.DIAGNOSIS_GET}/${Id}`;
        return await emr_utility.getBlockChainRequest(historyGetURL, TOKEN);
    };

    const _queryStringDiagnosisBlockChain = async (queryStringObject) => {
        let diagnosisCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.DIAGNOSIS_QUERY_STRING}`;
        return await emr_utility.postRequest(diagnosisCreateUrl, { Authorization: TOKEN }, { "selector": queryStringObject });
    };
    return {
        createDiagnosisMasterBlockChain: _createDiagnosisMasterBlockChain,
        deleteDiagnosisBlockChain: _deleteDiagnosisBlockChain,
        getDiagnosisBlockChain: _getDiagnosisBlockChain,
        queryStringDiagnosisBlockChain: _queryStringDiagnosisBlockChain
    };
};


module.exports = diagnosisMasterBlockChain();