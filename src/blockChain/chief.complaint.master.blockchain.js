// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const chiefComplaintMasterBlockChain = () => {
    const _createChiefComplaintMasterBlockChain = async (chiefComplaintObject) => {
        let chiefComplaintCreateUrl = await emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.CHIEF_COMPLIANT_CREATE}`;
        const chiefComplaintCreateObjects = chiefComplaintObject.map((cO) => {
            return emr_utility
                .postRequest(chiefComplaintCreateUrl, { Authorization: TOKEN },
                    {
                        Id: cO.uuid,
                        CreatedOn: cO.created_date,
                        CreatedBy: cO.created_by,
                        IsDelete: false,
                        Patient_id: cO.patient_uuid,
                        Encounter_id: cO.encounter_uuid,
                        Complaint_date: cO.performed_date,
                        Chief_complaint_category: "cO",
                        Chief_complaint_uuid: cO.chief_complaint_uuid,
                        Chief_complaint_code: "cO",
                        Chief_complaint_name: "cO",
                        Chief_complaint_duration: cO.chief_complaint_duration,
                        Complaint_from_date: cO.created_date
                    });
        });
        return await Promise.all(chiefComplaintCreateObjects);
    };
    const _queryStringChiefComplaintBlockChain = async (queryStringObject) => {
        let chiefComplaintCreateUrl = emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.CHIEF_COMPLIANT_QUERY_STRING}`;
        return await emr_utility.postRequest(chiefComplaintCreateUrl, { Authorization: TOKEN }, { "selector": queryStringObject });
    };
    return {
        createChiefComplaintMasterBlockChain: _createChiefComplaintMasterBlockChain,
        queryStringChiefComplaintBlockChain: _queryStringChiefComplaintBlockChain
    };
};


module.exports = chiefComplaintMasterBlockChain();