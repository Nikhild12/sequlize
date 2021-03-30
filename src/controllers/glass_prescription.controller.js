const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const rp = require("request-promise");
var config = require("../config/config");
// EMR Constants Import
const emr_constants = require('../config/constants');

// EMR Utility Import
const emr_utility = require('../services/utility.service');

const glass_prescription_tbl = db.glass_prescription;
const glass_prescription_details_tbl = db.glass_prescription_details;

const glassPrescriptionController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  //method to create glass prescription details        --by Manikanta
  async function details_function(req) {
    try {
      let data = await glass_prescription_details_tbl.bulkCreate(req);
      return data;
    }
    catch (err) {
      return { errors: err };
    }
  }
  //method to create glass prescription               --by Manikanta
  const _postGlassPrescription = async (req, res) => {
    try {
      let glassPrescriptionObj = req.body;
      const { user_uuid } = req.headers;
      if (typeof glassPrescriptionObj.header != "object" || Object.keys(glassPrescriptionObj.header).length < 1) {
        throw {
          error_type: "validationError",
          errors: "Error in header input",
        };
      }
      if (!Array.isArray(glassPrescriptionObj.details) || glassPrescriptionObj.details.length < 1) {
        throw {
          error_type: validationError,
          errors: "Error in Details input"
        };
      }
      glassPrescriptionObj.header = emr_utility.createIsActiveAndStatus(
        glassPrescriptionObj.header,
        user_uuid
      );
      let glass_prescription_details_output, glass_prescription_output;
      glass_prescription_output = await glass_prescription_tbl.create(glassPrescriptionObj.header);
      if (!glass_prescription_output) {
        throw {
          error_type: "validationError",
          errors: "Error while inserting Glass Prescription data",
        };
      }
      for (let e of glassPrescriptionObj.details) {
        e.prescription_uuid = glass_prescription_output.dataValues.uuid;
        e.created_by = user_uuid;
      }
      glass_prescription_details_output = await details_function(glassPrescriptionObj.details);
      if (glass_prescription_details_output.errors) {
        await patient_bills_tbl.update({ status: 0, modified_by: glassPrescriptionObj.patient_bills.created_by }, { where: { uuid: glass_prescription_output.dataValues.uuid } });
        await patient_payments_tbl.update({ status: 0, modified_by: glassPrescriptionObj.patient_bills.created_by }, { where: { uuid: patient_payments_output.dataValues.uuid } });
        throw {
          error_type: "validationError",
          errors: glass_prescription_details_output.errors,
        };
      }
      return res
        .status(200)
        .json({
          statusCode: 200,
          responseContents: glass_prescription_output
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
        .status(400)
        .send({
          code: httpStatus.BAD_REQUEST,
          message: errorMsg
        });
    }
  }

  return {
    postGlassPrescription: _postGlassPrescription
  };
};


module.exports = glassPrescriptionController();

