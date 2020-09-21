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
        const diagnosisCreateObjects = emr_utility
            .postRequest(diagnosisCreateUrl, { Authorization: TOKEN },
                {
                    Id: diagnosisObject,
                    CreatedOn: diagnosisObject,
                    CreatedBy: diagnosisObject,
                    IsDelete: false,
                    Patient_id: diagnosisObject,
                    Encounter_id: diagnosisObject,
                    Diagnosis_type: diagnosisObject,
                    Diagnosis_uuid: diagnosisObject,
                    Diagnosis_code: diagnosisObject,
                    Diagnosis_name: diagnosisObject,
                    Is_chronic: diagnosisObject,
                    Diagnosis_date: diagnosisObject,
                    Other_diagnosis_details: diagnosisObject,
                    Bodysite: diagnosisObject
                }
            );
        return diagnosisCreateObjects;
    };
    return {
        createDiagnosisMasterBlockChain: _createDiagnosisMasterBlockChain
    };
};


module.exports = diagnosisMasterBlockChain();