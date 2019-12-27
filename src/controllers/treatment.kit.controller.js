// Package Import
const httpStatus = require("http-status");
// const tickSheetDebug = require('debug')('app:favourite');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

// Initialize Tick Sheet Master
const treatmentkitTbl = sequelizeDb.treatment_kit;
const treatmentkitLabTbl = sequelizeDb.treatment_kit_lab_map;
const treatmentkitRadiologyTbl = sequelizeDb.treatment_kit_radiology_map;
const treatmentkitDrugTbl = sequelizeDb.treatmentkit_drug_map;
const treatmentkitInvestigationTbl = sequelizeDb.treatment_kit_investigation_map;
const treatment_kit_diagnosis_map = sequelizeDb.treatment_kit_diagnosis_map;


const TreatMent_Kit = () => {

    /**
     * Creating Treatment Kit
     * @param {*} req 
     * @param {*} res 
     */
    const _createTreatmentKit = async (req, res) => {

        const { user_uuid } = req.headers;
        const { treatment_kit, treatment_kit_lab, treatment_kit_drug } = req.body;
        const { treatment_kit_investigation, treatment_kit_radiology, treatment_kit_diagnosis } = req.body;

        if (user_uuid && treatment_kit && treatment_kit.name && treatment_kit.code) {
            try {

                const treatmentSave = [];

                // checking for Duplicate 
                // before creating Treatment 
                const duplicateTreatmentRecord = treatmentkitTbl.findAll({
                    attributes: ['code', 'name'],
                    where: {
                        [Op.or]: [
                            { code: treatment_kit.code },
                            { name: treatment_kit.name }
                        ]
                    }
                });

                if (duplicateTreatmentRecord && duplicateTreatmentRecord.length > 0) {
                    const duplicate_msg = duplicateTreatmentRecord[0].tsm_active[0] === 1 ? duplicate_active_msg : duplicate_in_active_msg;
                    return res.status(400).send({ code: "DUPLICATE_RECORD", message: duplicate_msg });

                }

                treatment_kit = emr_utility.createIsActiveAndStatus(treatment_kit);
                const treatmentSavedData = await treatmentkitTbl.create(treatment_kit, { returning: true });

                if (treatment_kit_lab && treatment_kit_lab.test_master_uuid && treatmentSavedData) {
                    treatment_kit_lab = emr_utility.createIsActiveAndStatus(treatment_kit_lab);
                    treatment_kit_lab.treatment_kit_uuid = treatmentSavedData && treatmentSavedData.uuid || 0;
                    treatmentSave = [...treatmentSave,

                    ];
                }

                if (treatment_kit_drug && item_master_uuid.item_master_uuid && treatmentSavedData) {

                }

                if (treatment_kit_investigation && treatment_kit_investigation.test_master_uuid && treatmentSavedData) {

                }


            } catch (ex) {

            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    }
    return {

        createTreatmentKit: _createTreatmentKit

    }

}
module.exports = TreatMent_Kit();
