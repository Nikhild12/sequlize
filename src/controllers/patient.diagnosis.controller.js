
// Package Import
const httpStatus = require("http-status");

const moment = require('moment');

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

var Sequelize = require('sequelize');
var Op = Sequelize.Op;


const patient_diagnosis_tbl = sequelizeDb.patient_diagnosis;
const diagnosis_tbl = sequelizeDb.diagnosis;

const emr_constants = require('../config/constants');
const utilityService = require('../services/utility.service');
const getActiveAndStatusObject = (is_active) => {
    return {

        is_active: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE,
        status: is_active ? emr_constants.IS_ACTIVE : emr_constants.IS_IN_ACTIVE

    };
};

const getPatientDiagnosisAttributes = () => {
    return [
        'uuid',
        'diagnosis_uuid',
        'other_diagnosis',
        'is_snomed',
        'is_patient_condition',
        'condition_type_uuid',
        'condition_date',
        'comments',
        'created_date',
        'modified_date',
        'performed_by'
    ];
};

const PatientDiagnsis = () => {

    const _createPatientDiagnosis = async (req, res) => {

        const { user_uuid } = req.headers;
        const patientsDiagnosisData = req.body;

        // checking user id and 
        // req data length
        if (user_uuid && patientsDiagnosisData.length > 0) {


            try {

                // if the bit is not set
                // setting it to `0`
                patientsDiagnosisData.forEach((pD) => {
                    pD.is_snomed = pD.is_snomed || emr_constants.IS_ACTIVE;
                    pD.is_patient_condition = pD.is_patient_condition || emr_constants.IS_ACTIVE;
                    pD.is_chronic = pD.is_chronic || emr_constants.IS_ACTIVE;

                    pD.is_active = pD.status = emr_constants.IS_ACTIVE;

                    pD.created_by = pD.modified_by = pD.performed_by = user_uuid;
                    pD.modified_date = pD.created_date = new Date();
                });

                const patientDiagnosisCreatedData = await patient_diagnosis_tbl.bulkCreate(patientsDiagnosisData, { returning: true });
                return res.status(200).send({ code: httpStatus.OK, message: "Inserted Patient Diagnosis Complaints Successfully", responseContents: appendUUIDToReqData(patientsDiagnosisData, patientDiagnosisCreatedData) });

            } catch (ex) {

                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }

    };

    const _getPatientDiagnosisFilters = async (req, res) => {

        try {
        const { user_uuid } = req.headers;
        const { searchKey, searchValue, patientId, departmentId, facility_uuid, from_date, to_date } = req.query;

        if (user_uuid && searchKey && searchValue && patientId && departmentId && facility_uuid && from_date, to_date) {
            const patientDiagnosisData = await patient_diagnosis_tbl.findAll(getPatientFiltersQuery1(searchKey, searchValue, patientId, departmentId, user_uuid, facility_uuid, from_date, to_date));
            return res.status(200).send({ code: httpStatus.OK, message: "Fetched Patient Diagnosis Successfully", responseContents: getPatientData(patientDiagnosisData) });
        }
        
        else if (user_uuid && searchKey && searchValue && patientId && departmentId) {
                const patientDiagnosisData = await patient_diagnosis_tbl.findAll(getPatientFiltersQuery(searchKey, searchValue, patientId, departmentId, user_uuid));
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched Patient Diagnosis Successfully", responseContents: getPatientData(patientDiagnosisData) });
        } else {
            return res.status(422).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
        }
        } catch (ex) {
        console.log(ex);
        return res.status(422).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
    };

    return {
        createPatientDiagnosis: _createPatientDiagnosis,
        getPatientDiagnosisByFilters: _getPatientDiagnosisFilters
    };
};

module.exports = PatientDiagnsis();

/**
 * 
 * @param {*} req i.e. body
 * @param {*} res i.e created data
 */
function appendUUIDToReqData(req, res) {

    req.forEach((r, idx) => {
        r.uuid = res[idx].uuid;
    });
    return req;
}

/**
 * 
 * @param {*} key search key
 * @param {*} value search key value
 * @param {*} pId patient Id
 * @param {*} dId department Id
 * @param {*} uId user Id
 */
function getPatientFiltersQuery(key, value, pId, dId, uId, from_date, to_date) {

    let filtersQuery = {};
    switch (key) {
        case 'getLatestDiagnosis':
            filtersQuery = {
                limit: +value,
                attributes: getPatientDiagnosisAttributes(),
                order: [['uuid', 'DESC']]
                };
            break;
        
        default:
            break;
    }

    filtersQuery.include = [
        {
            model: diagnosis_tbl,
            attributes: ['code', 'name']
        }
    ];
    filtersQuery.where = {
        department_uuid: dId,
        patient_uuid: pId,
        performed_by: uId
    };
    
    filtersQuery.attributes = getPatientDiagnosisAttributes();
    Object.assign(filtersQuery.where, utilityService.getActiveAndStatusObject(emr_constants.IS_ACTIVE));
    return filtersQuery;
}

function getPatientFiltersQuery1(key, value, pId, dId, uId, facility_uuid, from_date, to_date) {

    let filtersQuery = {};
    switch (key) {
        case 'date':
                filtersQuery = {
                    limit: +value,
                    attributes: getPatientDiagnosisAttributes(),
                    order: [['uuid', 'DESC']]
                };
                break;
        default:
            break;
    }

    filtersQuery.include = [
        {
            model: diagnosis_tbl,
            attributes: ['code', 'name']
        }
    ];
    filtersQuery.where = {
        patient_uuid: pId,
        facility_uuid: facility_uuid,
        created_date: {
            [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('created_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col('created_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
            ] 
            }
        
    };
    filtersQuery.attributes = getPatientDiagnosisAttributes();
    Object.assign(filtersQuery.where, utilityService.getActiveAndStatusObject(emr_constants.IS_ACTIVE));
    return filtersQuery;
}


function getPatientData(responseData) {
    return responseData.map((rD) => {
        return {
            patient_diagnosis_id: rD.uuid || 0,
            diagnosis_created_date: rD.created_date,
            diagnosis_modified_date: rD.modified_date,
            diagnosis_performed_by: rD.performed_by,
            diagnosis_name: rD.diagnosis && rD.diagnosis.name ? rD.diagnosis.name : '',
            diagnosis_code: rD.diagnosis && rD.diagnosis.code ? rD.diagnosis.code : '',
            diagnosis_is_snomed: rD.is_snomed[0] === 1 ? true : false
        };
    });
}
