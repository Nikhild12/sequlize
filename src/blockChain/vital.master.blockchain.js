// Constants Import
const emr_constants = require('../config/constants');

// Config Import
const config = require('../config/config');

// Utility Service Import
const emr_utility = require('../services/utility.service');

// Blockchain initialize
const { BLOCK_CHAIN_URL, TOKEN } = emr_constants.BLOCK_CHAIN;

const VitalMasterBlockChain = () => {

    const _createVitalMasterBlockChain = async (vitalObject) => {
        const vitalCreateUrl = `${config.blockChainURL}${BLOCK_CHAIN_URL.VITAL_CREATE}`;
        const vitalCreateObjects = vitalObject.map((vO) => {
            return emr_utility
                .postRequest(vitalCreateUrl, { Authorization: TOKEN },
                    {
                        Id: vO.uuid,
                        CreatedOn: vO.created_date,
                        CreatedBy: vO.created_by,
                        IsDelete: false,
                        Vitals: vO.vital_master_uuid,
                        DoctorName: vO.doctor_uuid,
                        FacilityName: vO.facility_uuid,
                        DepartmentName: vO.department_uuid,
                        Metadata: "",
                        Patient_id: vO.patient_uuid
                    }
                );
        });

        return await Promise.all(vitalCreateObjects);
    };
    return {
        createVitalMasterBlockChain: _createVitalMasterBlockChain
    };
};


module.exports = VitalMasterBlockChain();