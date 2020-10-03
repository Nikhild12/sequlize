// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const queryStringBlockChain = () => {
    const _queryStringPatientBlockChain = async (queryStringObject) => {
        let patientCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.PATIENT_QUERY_STRING}`;
        return await emr_utility.postRequest(patientCreateUrl, { Authorization: TOKEN }, { "selector": queryStringObject });
    };
    const _queryStringLabRadInvBlockChain = async (queryStringObject) => {
        let labradinvCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.LMIS_RMIS_INV_QUERY_STRING}`;
        return await emr_utility.postRequest(labradinvCreateUrl, { Authorization: TOKEN }, { "selector": queryStringObject });
    };
    const _queryStringPrescriptionBlockChain = async (queryStringObject) => {
        let presciprionCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.PRESCRIPTION_QUERY_STRING}`;
        return await emr_utility.postRequest(presciprionCreateUrl, { Authorization: TOKEN }, { "selector": queryStringObject });
    };
    return {
        queryStringPatientBlockChain: _queryStringPatientBlockChain,
        queryStringLabRadInvBlockChain: _queryStringLabRadInvBlockChain,
        queryStringPrescriptionBlockChain: _queryStringPrescriptionBlockChain
    };
};


module.exports = queryStringBlockChain();