const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const rp = require("request-promise");
var config = require("../config/config");
const moment = require("moment");
// EMR Constants Import
const emr_constants = require('../config/constants');
const printService = require('../services/print.service');

// EMR Utility Import
const emr_utility = require('../services/utility.service');
// Appmaster service to service call
const appMasterData = require("../controllers/appMasterData");

const glass_prescription_tbl = db.glass_prescription;
const glass_prescription_details_tbl = db.glass_prescription_details;
const vision_type_tbl = db.vision_type;
const glassPrescriptionController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  const exclude_attributes = {
    "exclude": [
      'status', 'revision', 'is_active', 'created_by', 'modified_by', 'created_date', 'modified_date'
    ]
  }
  //method to create glass prescription details        --by Manikanta
  async function details_function(req, glass_prescription_output) {
    try {
      let result_data = [];
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
      return result_data;
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
        where: {},
        include: [
          {
            model: glass_prescription_details_tbl,
            attributes: ['uuid', 'prescription_uuid', 'vision_type_uuid', 're_sph', 're_cyl', 're_axis', 're_vis_acu', 'le_sph', 'le_cyl', 'le_axis', 'le_vis_acu'],
            include: [
              {
                model: vision_type_tbl,
                attributes: ['uuid', 'code', 'name']
              }
            ]
          }
        ]
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
        },
        include: [
          {
            model: glass_prescription_details_tbl,
            attributes: ['uuid', 'prescription_uuid', 'vision_type_uuid', 're_sph', 're_cyl', 're_axis', 're_vis_acu', 'le_sph', 'le_cyl', 'le_axis', 'le_vis_acu'],
            include: [
              {
                model: vision_type_tbl,
                attributes: ['uuid', 'code', 'name']
              }
            ]
          }
        ]
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
        where: { uuid: postData.header.Id }
      });
      if (!finddata) {
        throw {
          error_type: "validationError",
          errors: "Send Valid Input"
        };
      }
      data = await glass_prescription_tbl.update(postData.header, {
        where: { uuid: postData.header.Id }
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
      finddata = await glass_prescription_tbl.findOne({
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
      })
      if (data == 0) {
        throw {
          error_type: "validationError",
          errors: "Error While Deleting Glass Prescrition"
        };
      }
      await glass_prescription_details_tbl.update({ status: 0, modified_by: postData.modified_by }, {
        where: { prescription_uuid: postData.Id }
      })
      return res
        .status(200)
        .json({
          statusCode: 200,
          msg: "Deleted Successful",
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

  const _printGlassPrescription = async (req, res) => {
    try {
      let postData = req.body;
      const { user_uuid, facility_uuid } = req.headers;
      const authorization = req.headers.authorization || req.headers.Authorization;
      let data, detailsResponse;
      let findQuery = {
        where: {
          uuid: postData.Id
        },
        include: [
          {
            model: glass_prescription_details_tbl,
            attributes: ['uuid', 'prescription_uuid', 'vision_type_uuid', 're_sph', 're_cyl', 're_axis', 're_vis_acu', 'le_sph', 'le_cyl', 'le_axis', 'le_vis_acu'],
            include: [
              {
                model: vision_type_tbl,
                attributes: ['uuid', 'code', 'name']
              }
            ]
          }
        ]
      };
      data = await glass_prescription_tbl.findOne(findQuery);
      const facilityResponse = await appMasterData.getFacilityDetailsById(user_uuid, authorization, facility_uuid);
      const patientResponse = await appMasterData.getPatientById(user_uuid, authorization, data.patient_uuid);
      const doctorResponse = await appMasterData.getDoctorDetails(user_uuid, authorization, [data.doctor_uuid]);
      const departmentResponse = await appMasterData.getDepartments(user_uuid, authorization, [data.department_uuid]);
      detailsResponse = getDetails(facilityResponse.responseContents, doctorResponse.responseContents[0], departmentResponse.responseContent.rows[0], patientResponse.responseContent, data);

      let obj = {
        header: detailsResponse,
        details: data.glass_prescription_details
      }
      const pdfBuffer = await printService.createPdf(printService.renderTemplate((__dirname + "/../assets/templates/glassprescription.html"), {
        headerObj: obj
      }),
        {
          format: 'A4',
          orientation: "landscape",
          header: {
            height: '20mm'
          },
          footer: {
            height: '20mm',
            contents: {
              default: '<div style="color: #444;text-align: right;font-size: 10px;padding-right:0.5in;">Page Number: <span>{{page}}</span>/<span>{{pages}}</span></div>'
            }
          },
        });
      if (pdfBuffer) {
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-disposition': 'attachment;filename=glassprescription.pdf',
          'Content-Length': pdfBuffer.length
        });
        res.end(Buffer.from(pdfBuffer, 'binary'));
        return;
      } else {
        return res.status(400).send({
          status: "failed",
          statusCode: httpStatus[500],
          message: ND_constats.WENT_WRONG
        });
      }
    }
    catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res
        .status(400)
        .send({
          code: httpStatus.BAD_REQUEST,
          message: errorMsg
        });
    }
  };

  function getDetails(facilityResponse, doctorResponse, departmentResponse, patientResponse, glassPrescriptionResponse) {
    let address, address_1, address_2, pincode_uuid, state, district, country;
    address_1 = facilityResponse.address_line1;
    address_2 = facilityResponse.address_line2;
    pincode_uuid = facilityResponse.pincode_uuid;
    state = facilityResponse.state_uuid ? facilityResponse.state_master.name : '';
    district = facilityResponse.district_uuid ? facilityResponse.district_master.name : '';
    country = facilityResponse.country_uuid ? facilityResponse.country_master.name : '';

    address = address_1 ? address_1 : "";
    address = address_2 ? (address ? address + "," + address_2 : address_2) : address;
    address = district ? (address ? address + "," + district : district) : address;
    address = state ? (address ? address + "," + state : state) : address;
    address = country ? (address ? address + "," + country : country) : address;
    address = pincode_uuid ? (address ? address + "," + pincode_uuid : pincode_uuid) : address;
    return {
      // facility
      facility: facilityResponse.facility.name,
      // facility address
      address: address,
      // doctor
      doctor: doctorResponse.first_name,
      // department
      department: departmentResponse.name,
      // patient
      pin: patientResponse.uhid,
      patient: patientResponse.title ? patientResponse.salutation_details.name + patientResponse.first_name : patientResponse.first_name,
      ageAndGender: patientResponse.age + patientResponse.period_detail.name + "/" + patientResponse.gender_details.name,
      // glass prescription
      reference_no: glassPrescriptionResponse.prescription_no,
      ipd: glassPrescriptionResponse.ipd,
      glass_type: glassPrescriptionResponse.glass_type,
      notes: glassPrescriptionResponse.notes,
      date: moment(new Date()).format('DD-MMM-YYYY HH:mm')
    };
  }

  return {
    postGlassPrescription: _postGlassPrescription,
    getGlassPrescription: _getGlassPrescription,
    getGlassPrescriptionById: _getGlassPrescriptionById,
    updateGlassPrescriptionById: _updateGlassPrescriptionById,
    deleteGlassPrescriptionById: _deleteGlassPrescriptionById,
    printGlassPrescription: _printGlassPrescription
  };
};


module.exports = glassPrescriptionController();

