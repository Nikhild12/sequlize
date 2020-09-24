// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const vitalMasterBlockChain = () => {
    const _createVitalMasterBlockChain = async (vitalObject) => {
        const vitalCreateUrl = await emr_utility.deployedBlockChainUrl() + `${BLOCK_CHAIN_URL.VITAL_CREATE}`;
        const vitalCreateObjects = vitalObject.map((vO) => {
            return emr_utility
                .postRequest(vitalCreateUrl, { Authorization: TOKEN },
                    {
                        Id: vO.uuid,
                        CreatedOn: vO.created_date,
                        CreatedBy: vO.created_by ? vO.created_by : '',
                        IsDelete: false,
                        Patient_id: vO.patient_uuid ? vO.patient_uuid : '',
                        Encounter_id: vO.encounter_uuid ? vO.encounter_uuid : '',
                        Performed_date: vO.modified_date,
                        Vital_type: vO.vital_type_uuid ? vO.vital_type_uuid : '',
                        Vital_name: vO.name ? vO.name : '',
                        Vital_description: vO.comments ? vO.comments : '',
                        Reference_range_from: vO.created_date,
                        Reference_range_to: vO.reference_range_to ? vO.reference_range_to : '',
                        Result_value: "",
                        Uom: vO.vital_uom_uuid ? vO.vital_uom_uuid : '',
                        Uom_code: "",
                        Uom_name: ""
                    }
                );
        });
        return await Promise.all(vitalCreateObjects);
    };
    return {
        createVitalMasterBlockChain: _createVitalMasterBlockChain
    };
};


module.exports = vitalMasterBlockChain();