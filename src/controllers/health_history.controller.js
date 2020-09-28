const httpStatus = require("http-status");
const db = require("../config/sequelize");
const constants = require('../config/constants');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require("lodash");
const encounterBlockChain = require('../blockChain/encounter.blockchain');
const patientBlockChain = require('../blockChain/patient.blockchain');


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
            let patient_query_string_output, encounter_query_string_output;
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