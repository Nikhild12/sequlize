const httpStatus = require("http-status");
const db = require("../config/sequelize");
const constants = require('../config/constants');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require("lodash");
const encounterBlockChain = require('../blockChain/encounter.blockchain');
const chiefComplaintBlockChain = require('../blockChain/chief.complaint.master.blockchain');
const vitalBlockChain = require('../blockChain/vital.master.blockchain');
const patientAllergyBlockChain = require('../blockChain/patient.allergy.blockchain');
const diagnosisBlockChain = require('../blockChain/diagnosis.blockchain');
const immunizationBlockChain = require('../blockChain/immunization.blockchain');
const familyHistoryBlockChain = require('../blockChain/family.history.blockchain');
const queryStringBlockChain = require('../blockChain/querystring.blockchain');
const emr_utility = require('../services/utility.service');
const config = require('../config/config');
const { APPMASTER_GET_SPECIFIC_DEPARTMENT, APPMASTER_GET_SPECIFIC_USERS, APPMASTER_GET_SPECIFIC_FACILITY } = constants.DEPENDENCY_URLS;

const healthHistoryController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    /*=============== health_history API's================*/
    const _gethealthHistory = async (req, res, next) => {
        try {
            let postData = req.body;
            let { user_uuid, authorization } = req.headers;
            let patient_query_string_output, encounter_query_string_output, faility_uuids = [], department_uuids = [], doctor_uuids = [];
            let doctor_url = config.wso2AppUrl + APPMASTER_GET_SPECIFIC_USERS;
            let department_url = config.wso2AppUrl + APPMASTER_GET_SPECIFIC_DEPARTMENT;
            let facility_url = config.wso2AppUrl + APPMASTER_GET_SPECIFIC_FACILITY;
            let headers = {
                Authorization: authorization,
                user_uuid: user_uuid
            };
            if (typeof postData != "object" || Object.keys(postData).length < 1) {
                throw {
                    error_type: "validationError",
                    errors: "invalid object",
                };
            }
            patient_query_string_output = await queryStringBlockChain.queryStringPatientBlockChain(postData);
            if (patient_query_string_output.data.length == 0) {
                throw {
                    error_type: "validationError",
                    errors: "no patient found with given data"
                };
            }
            encounter_query_string_output = await encounterBlockChain.queryStringEncounterBlockChain({ "Patient_id": patient_query_string_output.data[0].Id });
            for (let e of encounter_query_string_output.data) {
                faility_uuids.push(e.Facility_uuid);
                department_uuids.push(e.Department_uuid);
                doctor_uuids.push(e.Doctor_uuid);
            }

            let specific_facility = await emr_utility.postRequest(
                facility_url,
                headers,
                {
                    uuid: faility_uuids
                }
            );
            let specific_doctor = await emr_utility.postRequest(
                doctor_url,
                headers,
                {
                    uuid: doctor_uuids
                }
            );
            let specific_department = await emr_utility.postRequest(
                department_url,
                headers,
                {
                    uuid: department_uuids
                }
            );
            for (let e of encounter_query_string_output.data) {
                for (let f of specific_facility) {
                    if (e.Facility_uuid == f.uuid) {
                        e.facility_name = f.name;
                    }
                }
                for (let d of specific_doctor) {
                    if (e.Doctor_uuid == d.uuid) {
                        e.doctor_user_name = d.user_name;
                        e.doctor_name = d.first_name;
                        e.doctor_title_name = d.title.name;
                    }
                }
                for (let r of specific_department.rows) {
                    if (e.Department_uuid == r.uuid) {
                        e.department_name = r.name;
                    }
                }
            }
            return res
                .status(200)
                .json({
                    statusCode: 200,
                    responseContents: encounter_query_string_output.data,
                    totalRecords: encounter_query_string_output.data.length
                });
        } catch (err) {
            if (typeof err.error_type != 'undefined' && err.error_type == "validationError") {
                return res.status(400).json({
                    statusCode: 400,
                    msg: err.errors,
                    Error: "validationError"
                });
            }
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(500)
                .json({
                    statusCode: 500,
                    msg: errorMsg,
                    Error: "error"
                });
        }
    };
    const _viewHealthHistory = async (req, res, next) => {
        try {
            let postData = req.body;
            let CHIEF_COMPLIANT_OUTPUT, VITAL_OUTPUT, ALLERGY_OUTPUT, DIAGNOSIS_OUTPUT, LMIS_OUTPUT, RMIS_OUTPUT, INV_OUTPUT, PRESCRIPTION_OUTPUT, IMMUNIZATION_OUTPUT, FAMILY_HISTORY_OUTPUT;
            if (!(postData.Encounter_id) || postData.Encounter_id == '0') {
                throw {
                    error_type: "validationError",
                    errors: 'Invalid Input'
                };
            }
            CHIEF_COMPLIANT_OUTPUT = await chiefComplaintBlockChain.queryStringChiefComplaintBlockChain(postData);
            VITAL_OUTPUT = await vitalBlockChain.queryStringVitalMasterBlockChain(postData);
            ALLERGY_OUTPUT = await patientAllergyBlockChain.queryStringPatientAllergyBlockChain(postData);
            DIAGNOSIS_OUTPUT = await diagnosisBlockChain.queryStringDiagnosisBlockChain(postData);
            LMIS_OUTPUT = await queryStringBlockChain.queryStringLabRadInvBlockChain(postData);
            RMIS_OUTPUT = await queryStringBlockChain.queryStringLabRadInvBlockChain(postData);
            INV_OUTPUT = await queryStringBlockChain.queryStringLabRadInvBlockChain(postData);
            PRESCRIPTION_OUTPUT = await queryStringBlockChain.queryStringPrescriptionBlockChain(postData);
            IMMUNIZATION_OUTPUT = await immunizationBlockChain.queryStringImmunizationBlockChain(postData);
            FAMILY_HISTORY_OUTPUT = await familyHistoryBlockChain.queryStringFamilyHistoryBlockChain(postData);
            return res
                .status(200)
                .json({
                    statusCode: 200,
                    responseContents: {
                        CHIEF_COMPLIANT_OUTPUT: CHIEF_COMPLIANT_OUTPUT ? CHIEF_COMPLIANT_OUTPUT.data : null,
                        VITAL_OUTPUT: VITAL_OUTPUT ? VITAL_OUTPUT.data : null,
                        ALLERGY_OUTPUT: ALLERGY_OUTPUT ? ALLERGY_OUTPUT.data : null,
                        DIAGNOSIS_OUTPUT: DIAGNOSIS_OUTPUT ? DIAGNOSIS_OUTPUT.data : null,
                        LMIS_OUTPUT: LMIS_OUTPUT ? LMIS_OUTPUT.data : null,
                        RMIS_OUTPUT: RMIS_OUTPUT ? RMIS_OUTPUT.data : null,
                        INV_OUTPUT: INV_OUTPUT ? INV_OUTPUT.data : null,
                        PRESCRIPTION_OUTPUT: PRESCRIPTION_OUTPUT ? PRESCRIPTION_OUTPUT.data : null,
                        IMMUNIZATION_OUTPUT: IMMUNIZATION_OUTPUT ? IMMUNIZATION_OUTPUT.data : null,
                        FAMILY_HISTORY_OUTPUT: FAMILY_HISTORY_OUTPUT ? FAMILY_HISTORY_OUTPUT.data : null
                    }
                });
        }
        catch (err) {
            if (typeof err.error_type != 'undefined' && err.error_type == "validationError") {
                return res.status(400).json({
                    statusCode: 400,
                    msg: err.errors,
                    Error: "validationError"
                });
            }
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(500)
                .json({
                    statusCode: 500,
                    msg: errorMsg,
                    Error: "error"
                });
        }
    };
    return {
        gethealthHistory: _gethealthHistory,
        viewHealthHistory: _viewHealthHistory
    };
};


module.exports = healthHistoryController();