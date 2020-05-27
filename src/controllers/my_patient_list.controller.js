// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");

const VWMyPatientList = sequelizeDb.vw_my_patient_list;

// Constant Serivce
const emr_constants = require("../config/constants");

// Utility Service
const emr_utility = require("../services/utility.service");

const myPatientlistAttributes = require("../attributes/my_patient_list");

// Pagination Default Values
let pageNo = 0;
let sortOrder = "DESC";
let sortField = "ec_performed_date";
let pageSize = 10;
let offset;

const MyPatientListController = () => {
  const _getMyPatientListByFilters = async (req, res) => {
    const { user_uuid } = req.headers;
    let { departmentId, from_date, to_date, doctor_id } = req.body;
    let { page_no, page_size, sort_order, sort_field, searchKey, searchValue } = req.body;

    let isFromDateValid, isToDateValid, defFromDate, defToDate;

    // Checking From Date
    defFromDate = emr_utility.indiaTz(from_date).toDate();
    isFromDateValid = emr_utility.checkDateValid(from_date);

    // Checking To date
    defToDate = emr_utility.indiaTz(to_date).toDate();
    isToDateValid = emr_utility.checkDateValid(to_date);

    // Checking Page Size and No
    pageNo = page_no && !isNaN(+(page_no)) ? page_no : 0;
    pageSize = page_size && !isNaN(+(page_size)) ? page_size : 10;

    sortOrder = sort_order === "ASC" || sort_order === "DESC" ? sort_order : sortOrder;
    sortField = sort_field ? sort_field : sortField;
    if (
      user_uuid && isFromDateValid && isToDateValid && doctor_id && departmentId) {
      try {
        // 
        let mypatientListQuery = {
          where: {}
        };
        mypatientListQuery.where = emr_utility.comparingDateAndTime("ec_performed_date", defFromDate, defToDate);
        mypatientListQuery.where.ec_doctor_uuid = +(doctor_id);
        mypatientListQuery.where.d_uuid = +(departmentId);
        if (["pa_pin", "pd_mobile", "p_old_pin"].includes(searchKey)) {
          mypatientListQuery.where[searchKey] = searchValue;
        }

        offset = pageNo * pageSize;
        const myPatientList = await VWMyPatientList.findAndCountAll({
          offset: offset,
          limit: pageSize,
          order: [[`${sortField}`, `${sortOrder}`]],
          where: mypatientListQuery.where,
          attributes: myPatientlistAttributes.myPatientListAttributes
        });
        const returnMessage =
          myPatientList && myPatientList.rows.length > 0 ? emr_constants.MY_PATIENT_LIST : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContents: myPatientList.rows,
          responseLength: myPatientList.length,
          totalRecords: myPatientList.count
        });
      } catch (ex) {
        console.log(ex);
        return res
          .status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }
    } else {
      offset;
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  return {
    getMyPatientListByFilters: _getMyPatientListByFilters
  };
};
module.exports = MyPatientListController();

function getMyPatientListResponseForUIFormat(myPatientList) {
  return myPatientList.map(pL => {
    return {
      patient_id: pL.patient_uuid,
      first_name: pL.pa_first_name,
      last_name: pL.pa_last_name,
      middle_name: pL.pa_middle_name,
      age: pL.pa_age,
      gender: pL.g_name,
      patient_pin: pL.pa_pin,
      patient_mobile: pL.pd_mobile,
      department: pL.department_name,
      department_id: pL.d_uuid,
      doctor_id: pL.ec_doctor_uuid,
      encounter_id: pL.ec_encounter_uuid,
      encounter_doctor_id: pL.ec_uuid,
      created_date: pL.ec_performed_date
    };
  });
}
