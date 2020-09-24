// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const ImmunizationAllergyBlockChain = () => {

    const _createImmunizationBlockchain = async (object) => {
        const immunizationCreateURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.IMMNUIZATION_CREATE}`;
        const create = {
            Id: object.uuid,
            CreatedOn: object.created_date,
            CreatedBy: object.created_by,
            IsDelete: false,
            Patient_id: object.patient_uuid,
            Encounter_id: object.encounter_uuid,
            Immunization_uuid: object.immunization_uuid,
            Immunization_code: "IMC",
            Immunization_name: "IMA",
            Route: "",
            Dosage: "",
            Administered_date: object.created_date,
            Administer_comments: "IMC"
        };

        return emr_utility
            .postRequest(immunizationCreateURL, { Authorization: TOKEN }, create);
    };

    const _deleteImmunizationBlockChain = async (Id) => {
        const immunizationDeleteURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.IMMUNIZATION_DELETE}`;
        return await emr_utility.deleteRequest(immunizationDeleteURL, TOKEN, { Id });
    };

    const _getImmunizationBlockChain = async (Id) => {
        const immunizationGetURL = `${emr_utility.deployedBlockChainUrl()}${BLOCK_CHAIN_URL.IMMUNIZATION_GET}/${Id}`;
        return await emr_utility.getBlockChainRequest(immunizationGetURL, TOKEN);
    };

    return {
        createImmunizationBlockchain: _createImmunizationBlockchain,
        getImmunizationBlockChain: _getImmunizationBlockChain,
        deleteImmunizationBlockChain: _deleteImmunizationBlockChain
    };
};

module.exports = ImmunizationAllergyBlockChain();