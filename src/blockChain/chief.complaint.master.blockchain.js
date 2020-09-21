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
        const chiefComplaintCreateUrl = await emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.CHIEF_COMPLIANT_CREATE}`;
        const chiefComplaintCreateObjects = emr_utility
            .postRequest(chiefComplaintCreateUrl, { Authorization: TOKEN },
                {
                    Id: chiefComplaintObject,
                    CreatedOn: chiefComplaintObject,
                    CreatedBy: chiefComplaintObject,
                    IsDelete: false,
                    Patient_id: chiefComplaintObject,
                    Encounter_id: chiefComplaintObject,
                    Complaint_date: chiefComplaintObject,
                    Chief_complaint_category: chiefComplaintObject,
                    Chief_complaint_uuid: chiefComplaintObject,
                    Chief_complaint_code: chiefComplaintObject,
                    Chief_complaint_name: chiefComplaintObject,
                    Chief_complaint_duration: chiefComplaintObject,
                    Complaint_from_date: chiefComplaintObject
                }
            );
        return chiefComplaintCreateObjects;
    };
    return {
        createChiefComplaintMasterBlockChain: _createChiefComplaintMasterBlockChain
    };
};


module.exports = chiefComplaintMasterBlockChain();