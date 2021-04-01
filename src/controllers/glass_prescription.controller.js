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
  async function details_function(req, glass_prescription_output) {
    for (let e of req) {
      if (e.uuid) {
        e.modified_by = glass_prescription_output.modified_by;
      } else {
        e.prescription_uuid = glass_prescription_output.uuid;
        e.created_by = glass_prescription_output.created_by;
      }
      let bulkData = await glass_prescription_details_tbl.bulkCreate([e], {
        updateOnDuplicate: Object.keys(e)
      });
      for (let d of bulkData) {
        result_data.push(d.dataValues);
      }
    }
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
          error_type: "validationError",
          errors: "Error in Details input"
        };
      }
      let glass_prescription_get = await glass_prescription_tbl.findOne({
        where: { encounter_uuid: glassPrescriptionObj.header.encounter_uuid }
      })
      if (glass_prescription_get) {
        throw {
          error_type: "validationError",
          errors: "Data Already exists for same encounter"
        }
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
      glass_prescription_details_output = await details_function(glassPrescriptionObj.details, glass_prescription_output);
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

  const _getGlassPrescription = async (req, res) => {
    try {
      let postData = req.body;
      const { user_uuid, authorization } = req.headers;
      let data;
      let pageNo = 0;
      const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
      let sortArr = ['modified_date', 'DESC'];
      if (postData.pageNo) {
        let temp = parseInt(postData.pageNo);
        if (temp && (temp != NaN)) {
          pageNo = temp;
        }
      }
      const offset = pageNo * itemsPerPage;
      let fieldSplitArr = [];
      if (postData.sortField) {
        fieldSplitArr = postData.sortField.split('.');
        if (fieldSplitArr.length == 1) {
          sortArr[0] = postData.sortField;
        } else {
          for (let idx = 0; idx < fieldSplitArr.length; idx++) {
            const element = fieldSplitArr[idx];
            fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
          }
          sortArr = fieldSplitArr;
        }
      }
      if (postData.sortOrder && ((postData.sortOrder.toLowerCase() == 'asc') || (postData.sortOrder.toLowerCase() == 'desc'))) {
        if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
          sortArr[1] = postData.sortOrder;
        } else {
          sortArr.push(postData.sortOrder);
        }
      }
      let findQuery = {
        offset: offset,
        limit: itemsPerPage,
        order: [
          sortArr
        ],
        where: {}
      };
      ////////////encounter filter////////////////////////
      if (postData.encounter_uuid && /\S/.test(postData.encounter_uuid)) {
        findQuery.where = Object.assign(findQuery.where, {
          encounter_uuid: postData.encounter_uuid
        });
      }

      data = await glass_prescription_tbl.findAndCountAll(findQuery);
      return res
        .status(200)
        .json({
          statusCode: 200,
          responseContents: data.rows,
          totalRecords: data.count
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

  // fetch Glass Presciption by id using post method
  const _getGlassPrescriptionById = async (req, res) => {
    try {
      let postData = req.body;
      const { user_uuid, authorization } = req.headers;
      let data;
      let findQuery = {
        where: {
          uuid: postData.Id
        }
      };
      data = await glass_prescription_tbl.findOne(findQuery);
      return res
        .status(200)
        .json({
          statusCode: 200,
          responseContents: data
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
        .status(400)
        .send({
          code: httpStatus.BAD_REQUEST,
          message: errorMsg
        });
    }
  };
  // update Glass Presciption by id using post method
  const _updateGlassPrescriptionById = async (req, res) => {
    try {
      let postData = req.body;
      postData.header.modified_by = req.headers.user_uuid;
      let data, finddata;
      finddata = await glass_prescription_tbl.findOne({
        where: { uuid: postData.Id }
      });
      if (!finddata) {
        throw {
          error_type: "validationError",
          errors: "Send Valid Input"
        };
      }
      data = await glass_prescription_tbl.update(postData, {
        where: { uuid: postData.Id }
      });
      glass_prescription_details_output = await details_function(postData.details, data);
      return res
        .status(200)
        .json({
          statusCode: 200,
          responseContents: data
        });
    } catch (err) {
      if (typeof err.error_type != 'undefined' && err.error_type == "validationError") {
        return res.status(400).json({
          statusCode: 400,
          msg: err.errors,
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
  };
  // delete Glass Presciption by id using post method
  const _deleteGlassPrescriptionById = async (req, res) => {
    try {
      let postData = req.body;
      postData.modified_by = req.headers.user_uuid;
      let data, finddata;
      finddata = await patient_bills_tbl.findOne({
        where: { uuid: postData.Id }
      });
      if (!finddata) {
        throw {
          error_type: "validationError",
          errors: "Send Valid Input"
        };
      }
      data = await glass_prescription_tbl.update({ status: 0, modified_by: postData.modified_by }, {
        where: { uuid: postData.Id }
      });
      return res
        .status(200)
        .json({
          statusCode: 200,
          responseContents: data
        });
    } catch (err) {
      if (typeof err.error_type != 'undefined' && err.error_type == "validationError") {
        return res.status(400).json({
          statusCode: 400,
          msg: err.errors
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
  };


  return {
    postGlassPrescription: _postGlassPrescription,
    getGlassPrescription: _getGlassPrescription,
    getGlassPrescriptionById: _getGlassPrescriptionById,
    updateGlassPrescriptionById: _updateGlassPrescriptionById,
    deleteGlassPrescriptionById: _deleteGlassPrescriptionById
  };
};


module.exports = glassPrescriptionController();

