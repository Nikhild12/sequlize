// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const familyHistoryBlockChain = () => {
    const _createFamilyHistoryBlockChain = async (familyHistoryObject) => {
        const familyHistoryCreateUrl = await emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.FAMILY_HISTORY_CREATE}`;
        const familyHistoryCreateObjects = emr_utility
            .postRequest(familyHistoryCreateUrl, { Authorization: TOKEN },
                {
                    Id: familyHistoryObject.uuid,
                    CreatedOn: familyHistoryObject.created_date,
                    CreatedBy: familyHistoryObject.created_by,
                    IsDelete: false,
                    Patient_id: familyHistoryObject.patient_uuid,
                    Encounter_id: familyHistoryObject.encounter_uuid,
                    Relation_type: familyHistoryObject.relation_type_uuid,
                    Disease_uuid: familyHistoryObject.disease_uuid,
                    Disease_code: "familyHistoryObject",
                    Disease_name: familyHistoryObject.disease_name,
                    Disease_description: familyHistoryObject.disease_description,
                    Identified_date: familyHistoryObject.identified_date,
                    Duration: familyHistoryObject.duration
                });
        return familyHistoryCreateObjects;
    };

    const _deleteFamilyHistoryBlockChain = async (Id) => {
        const historyDeleteURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.FAMILY_DELETE}`;
        return await emr_utility.deleteRequest(historyDeleteURL, TOKEN, { Id });
    };

    const _getFamilyHistoryBlockChain = async (Id) => {
        const historyGetURL = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.FAMILY_GET}/${Id}`;
        return await emr_utility.getBlockChainRequest(historyGetURL, TOKEN);
    };
    return {
        createFamilyHistoryBlockChain: _createFamilyHistoryBlockChain,
        deleteFamilyHistoryBlockChain: _deleteFamilyHistoryBlockChain,
        getFamilyHistoryBlockChain: _getFamilyHistoryBlockChain
    };
};


module.exports = familyHistoryBlockChain();