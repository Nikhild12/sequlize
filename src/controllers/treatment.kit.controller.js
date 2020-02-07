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

// Treatment Kit Filters Query Function
const getByFilterQuery = (searchBy, searchValue, user_uuid, dept_id) => {
    searchBy = searchBy.toLowerCase();

    switch (searchBy) {
        case emr_constants.FILTERBYTHREE:

            filterByQuery = {
                is_active: emr_constants.IS_ACTIVE,
                status: emr_constants.IS_ACTIVE,
                [Op.and]: [
                    {
                        [Op.or]: [
                            {
                                name: {
                                    [Op.like]: `%${searchValue}%`
                                }
                            },
                            {
                                code: {
                                    [Op.like]: `%${searchValue}%`,
                                }
                            }
                        ],

                    },
                    {
                        [Op.or]: [
                            { "department_uuid": { [Op.eq]: dept_id }, "is_public": { [Op.eq]: emr_constants.IS_ACTIVE } }, { "user_uuid": { [Op.eq]: user_uuid } }
                        ]
                    }
                ]
            };
            return filterByQuery;
        case 'treatment_kit_id':
        default:
            return {
                uuid: searchValue,
                is_active: emr_constants.IS_ACTIVE,
                status: emr_constants.IS_ACTIVE
            };
    }
};

const getFilterByCodeAndNameAttributes = [
    'uuid',
    'treatment_kit_type_uuid',
    'code',
    'name'
];

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
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: emr_constants.TREATMENT_REQUIRED });
            }
            try {

                treatmentTransaction = await sequelizeDb.sequelize.transaction();
                let treatmentSave = [];
                const duplicateTreatmentRecord = await findDuplicateTreatmentKitByCodeAndName(treatment_kit);
                if (duplicateTreatmentRecord && duplicateTreatmentRecord.length > 0) {
                    return res.status(400).send({ code: emr_constants.DUPLICATE_ENTRIE, message: getDuplicateMsg(duplicateTreatmentRecord) });
                }
                treatment_kit = emr_utility.createIsActiveAndStatus(treatment_kit, user_uuid);
                const treatmentSavedData = await treatmentkitTbl.create(treatment_kit, { returning: true, transaction: treatmentTransaction });
                // Lab
                if (treatment_kit_lab && Array.isArray(treatment_kit_lab) && treatment_kit_lab.length > 0 && treatmentSavedData) {

                    // assigning Default Values
                    treatment_kit_lab.forEach((l) => {
                        l = emr_utility.assignDefaultValuesAndUUIdToObject(l, treatmentSavedData, user_uuid, 'treatment_kit_uuid');
                    });

                    // Treatment Kit Lab Save
                    treatmentSave = [...treatmentSave, treatmentkitLabTbl.bulkCreate(treatment_kit_lab, { returning: true, transaction: treatmentTransaction })];

                }
                // Drug
                if (treatment_kit_drug && Array.isArray(treatment_kit_drug) && treatment_kit_drug.length > 0 && treatmentSavedData) {

                    // assigning Default Values
                    treatment_kit_drug.forEach((dr) => {
                        dr = emr_utility.assignDefaultValuesAndUUIdToObject(dr, treatmentSavedData, user_uuid, 'treatment_kit_uuid');
                    });

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentkitDrugTbl.bulkCreate(treatment_kit_drug, { returning: true, transaction: treatmentTransaction })];

                }
                // Investigation 
                if (treatment_kit_investigation && Array.isArray(treatment_kit_investigation) && treatment_kit_investigation.length > 0 && treatmentSavedData) {
                    // assigning Default Values
                    treatment_kit_investigation.forEach((i) => {
                        i = emr_utility.assignDefaultValuesAndUUIdToObject(i, treatmentSavedData, user_uuid, 'treatment_kit_uuid');
                    });

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentkitInvestigationTbl.bulkCreate(treatment_kit_investigation, { returning: true, transaction: treatmentTransaction })];
                }
                // Diagnosis 
                if (treatment_kit_diagnosis && Array.isArray(treatment_kit_diagnosis) && treatment_kit_diagnosis.length > 0 && treatmentSavedData) {
                    // assigning Default Values
                    treatment_kit_diagnosis.forEach((d) => {
                        d = emr_utility.assignDefaultValuesAndUUIdToObject(d, treatmentSavedData, user_uuid, 'treatment_kit_uuid');
                    });

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentKitDiagnosisTbl.bulkCreate(treatment_kit_diagnosis, { returning: true, transaction: treatmentTransaction })];
                }
                // Radiology
                if (treatment_kit_radiology && Array.isArray(treatment_kit_radiology) && treatment_kit_radiology.length > 0 && treatmentSavedData) {
                    // assigning Default Values
                    treatment_kit_radiology.forEach((r) => {
                        r = emr_utility.assignDefaultValuesAndUUIdToObject(r, treatmentSavedData, user_uuid, 'treatment_kit_uuid');
                    });

                    // Treatment Kit Drug Save
                    treatmentSave = [...treatmentSave, treatmentkitRadiologyTbl.bulkCreate(treatment_kit_radiology, { returning: true, transaction: treatmentTransaction })];
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

    /**
     * Treatment Kit Filters Search
     * @param {*} req 
     * @param {*} res 
     */
    const _getTreatmentKitByFilters = async (req, res) => {

        const { user_uuid } = req.headers;
        const { searchKey, searchValue, departmentId } = req.query;

        if (user_uuid && searchKey && searchValue) {

            try {

                const treatmentKitFilteredData = await treatmentkitTbl.findAll({
                    where: getByFilterQuery(searchKey, searchValue, user_uuid, departmentId),
                    attributes: getFilterByCodeAndNameAttributes
                });
                const returnMessage = treatmentKitFilteredData.length > 0 ? emr_constants.FETCHD_TREATMENT_KIT_SUCCESSFULLY : emr_constants.NO_RECORD_FOUND;

                let response = getFilterTreatmentKitResponse(treatmentKitFilteredData);
                let responseLength = response.length;
                if (searchKey.toLowerCase() === 'treatment_kit_id') {
                    response = response[0];
                }
                return res.status(200).send({ code: httpStatus.OK, message: returnMessage, responseContents: response, responseLength });

            } catch (ex) {

                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });

            }

        } else {

            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });

        }


    };

    return {

        createTreatmentKit: _createTreatmentKit,
        getTreatmentKitByFilters: _getTreatmentKitByFilters

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
    return kit && Array.isArray(kit) && kit.length > 0;
}

function checkTreatmentKitDiagnosis(diagnosis) {
    return diagnosis && Array.isArray(diagnosis) && diagnosis.length > 0;
}

function checkTreatmentKitDrug(drug) {
    return drug && Array.isArray(drug) && drug.length > 0;
}

function getFilterTreatmentKitResponse(argument) {
    return argument.map((a) => {
        return {
            treatment_kit_id: a.uuid,
            treatment_code: a.code,
            treatment_name: a.name,
            treatment_type_id: a.treatment_kit_type_uuid
        };
    });
}



