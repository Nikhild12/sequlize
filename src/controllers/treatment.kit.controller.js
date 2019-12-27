// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

// Initialize Treatment Kit
const treatmentkitTbl = sequelizeDb.treatment_kit;
const treatmentkitLabTbl = sequelizeDb.treatment_kit_lab_map;
const treatmentkitRadiologyTbl = sequelizeDb.treatment_kit_radiology_map;
const treatmentkitDrugTbl = sequelizeDb.treatment_kit_drug_map;
const treatmentkitInvestigationTbl = sequelizeDb.treatment_kit_investigation_map;
const treatmentKitDiagnosisTbl = sequelizeDb.treatment_kit_diagnosis_map;

const TreatMent_Kit = () => {

    /**
     * Creating Treatment Kit
     * @param {*} req 
     * @param {*} res 
     */
    const _createTreatmentKit = async (req, res) => {

        const { user_uuid } = req.headers;
        let treatTransStatus = false;
        let treatmentTransaction;
        let { treatment_kit, treatment_kit_lab, treatment_kit_drug } = req.body;
        let { treatment_kit_investigation, treatment_kit_radiology, treatment_kit_diagnosis } = req.body;
        if (user_uuid && treatment_kit && treatment_kit.name && treatment_kit.code) {

            if (checkTreatmentKit(req)) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: 'Please send treatment Kit along with One widget details' });
            }
            try {

                treatmentTransaction = await sequelizeDb.sequelize.transaction();
                let treatmentSave = [];
                const duplicateTreatmentRecord = await findDuplicateTreatmentKitByCodeAndName(treatment_kit);
                if (duplicateTreatmentRecord && duplicateTreatmentRecord.length > 0) {
                    return res.send(400).send({ code: emr_constants.DUPLICATE_ENTRIE, message: getDuplicateMsg(duplicateTreatmentRecord) });
                }
                treatment_kit = emr_utility.createIsActiveAndStatus(treatment_kit, user_uuid);
                const treatmentSavedData = await treatmentkitTbl.create(treatment_kit, { returning: true, transaction: treatmentTransaction });
                // Lab
                if (treatment_kit_lab && treatment_kit_lab.test_master_uuid && treatmentSavedData) {

                    // assigning Default Values
                    treatment_kit_lab = emr_utility.assignDefaultValuesAndUUIdToObject(treatment_kit_lab, treatmentSavedData, user_uuid, 'treatment_kit_uuid');

                    // Treatment Kit Lab Save
                    treatmentSave = [...treatmentSave, treatmentkitLabTbl.create(treatment_kit_lab, { returning: true, transaction: treatmentTransaction })];

                }
                // Drug
                if (treatment_kit_drug && treatment_kit_drug.item_master_uuid && treatmentSavedData) {

                    // assigning Default Values
                    treatment_kit_drug = emr_utility.assignDefaultValuesAndUUIdToObject(treatment_kit_drug, treatmentSavedData, user_uuid, 'treatment_kit_uuid');

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentkitDrugTbl.create(treatment_kit_drug, { returning: true, transaction: treatmentTransaction })];

                }
                // Investigation 
                if (treatment_kit_investigation && treatment_kit_investigation.test_master_uuid && treatmentSavedData) {
                    // assigning Default Values
                    treatment_kit_investigation = emr_utility.assignDefaultValuesAndUUIdToObject(treatment_kit_investigation, treatmentSavedData, user_uuid, 'treatment_kit_uuid');

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentkitInvestigationTbl.create(treatment_kit_investigation, { returning: true, transaction: treatmentTransaction })];
                }
                // Diagnosis 
                if (treatment_kit_diagnosis && treatment_kit_diagnosis.diagnosis_uuid && treatmentSavedData) {
                    // assigning Default Values
                    treatment_kit_diagnosis = emr_utility.assignDefaultValuesAndUUIdToObject(treatment_kit_diagnosis, treatmentSavedData, user_uuid, 'treatment_kit_uuid');

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentKitDiagnosisTbl.create(treatment_kit_diagnosis, { returning: true, transaction: treatmentTransaction })];
                }
                // Radiology
                if (treatment_kit_radiology && treatment_kit_radiology.test_master_uuid && treatmentSavedData) {
                    // assigning Default Values
                    treatment_kit_radiology = emr_utility.assignDefaultValuesAndUUIdToObject(treatment_kit_radiology, treatmentSavedData, user_uuid, 'treatment_kit_uuid');

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentkitRadiologyTbl.create(treatment_kit_radiology, { returning: true, transaction: treatmentTransaction })];
                }

                await Promise.all(treatmentSave);
                await treatmentTransaction.commit();
                treatTransStatus = true;
                return res.status(200).send({ code: httpStatus.OK, message: emr_constants.TREATMENT_SUCCESS, reqContents: req.body });


            } catch (ex) {
                console.log('Exception happened', ex);
                if (treatmentTransaction) {
                    await treatmentTransaction.rollback();
                    treatTransStatus = true;
                }
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            } finally {

                if (treatmentTransaction && !treatTransStatus) {
                    treatmentTransaction.rollback();
                }
            }
        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    };

    return {

        createTreatmentKit: _createTreatmentKit

    };

};
module.exports = TreatMent_Kit();

async function findDuplicateTreatmentKitByCodeAndName({ code, name }) {
    // checking for Duplicate 
    // before creating Treatment 
    return await treatmentkitTbl.findAll({
        attributes: ['code', 'name', 'is_active'],
        where: {
            [Op.or]: [
                { code: code },
                { name: name }
            ]
        }
    });
}

function getDuplicateMsg(record) {
    return record[0].is_active ? emr_constants.DUPLICATE_ACTIVE_MSG : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
}

/**
 * In treatment Kit, 5 widgets are
 * included, in that any one of the widgets is required
 * before creating treatment kit
 * this methods checks that
 * @param {*} req 
 */
function checkTreatmentKit(req) {


    const { treatment_kit_lab, treatment_kit_drug } = req.body;
    const { treatment_kit_investigation, treatment_kit_radiology, treatment_kit_diagnosis } = req.body;

    return !checkTreatmentKitObj(treatment_kit_lab) &&
        !checkTreatmentKitDrug(treatment_kit_drug) &&
        !checkTreatmentKitObj(treatment_kit_investigation) &&
        !checkTreatmentKitObj(treatment_kit_radiology) &&
        !checkTreatmentKitDiagnosis(treatment_kit_diagnosis);

}


function checkTreatmentKitObj(kit) {
    return kit && kit.test_master_uuid;
}

function checkTreatmentKitDiagnosis(diagnosis) {
    return diagnosis && diagnosis.diagnosis_uuid;
}

function checkTreatmentKitDrug(drug) {
    return drug && drug.item_master_uuid;
}




