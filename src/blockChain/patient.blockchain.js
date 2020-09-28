// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const patientBlockChain = () => {
    const _queryStringPatientBlockChain = async (patientObject) => {
        const patientCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.PATIENT_QUERY_STRING}`;
        const patientCreateObjects = emr_utility.postRequest(patientCreateUrl, { Authorization: TOKEN }, { "selector": patientObject });
        return patientCreateObjects;
    };
    return {
        queryStringPatientBlockChain: _queryStringPatientBlockChain
    };
};


module.exports = patientBlockChain();