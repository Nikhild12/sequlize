const httpStatus = require("http-status");
const db = require("../config/sequelize");
const constants = require('../config/constants');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require("lodash");
const encounterBlockChain = require('../blockChain/encounter.blockchain');
const patientBlockChain = require('../blockChain/patient.blockchain');
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
            let patient_query_string_output, encounter_query_string_output, faility_uuids = [], department_uuids = [], doctor_uuids = [];
            let { user_uuid, authorization } = req.headers;
            if (typeof postData != "object" || Object.keys(postData).length < 1) {
                throw {
                    error_type: "validationError",
                    errors: "invalid object",
                };
            }
            patient_query_string_output = await patientBlockChain.queryStringPatientBlockChain(postData);
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
            let doctor_url = config.wso2AppUrl + APPMASTER_GET_SPECIFIC_USERS;
            let department_url = config.wso2AppUrl + APPMASTER_GET_SPECIFIC_DEPARTMENT;
            let facility_url = config.wso2AppUrl + APPMASTER_GET_SPECIFIC_FACILITY;
            let headers = {
                Authorization: authorization,
                user_uuid: user_uuid
            };
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
            for (let e of encounter_query_string_output.data){
                for(let f of specific_facility){
                    if(e.Facility_uuid == f.uuid){
                        e.facility_name = f.name;
                    }
                }
                for(let d of specific_doctor){
                    if(e.Doctor_uuid == d.uuid){
                        e.doctor_user_name = d.user_name;
                        e.doctor_name = d.first_name;
                        e.doctor_title_name = d.title.name;
                    }
                }
                for(let r of specific_department.rows){
                    if(e.Department_uuid == r.uuid){
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
    }

    return {
        gethealthHistory: _gethealthHistory
    };
};


module.exports = healthHistoryController();