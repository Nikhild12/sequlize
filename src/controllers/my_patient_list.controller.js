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
    let {
      page_no,
      page_size,
      sort_order,
      sort_field,
      searchKey,
      searchValue
    } = req.body;
    let defFromDate, defToDate;
    let isFromDateValid, isToDateValid;
    if (!from_date) {
      defFromDate = moment().format("YYYY-MM-DD");
      isFromDateValid = true;
    } else {
      defFromDate = moment(from_date).format("YYYY-MM-DD");
      isFromDateValid = moment(from_date).isValid();
    }

    if (!to_date) {
      defToDate = moment().format("YYYY-MM-DD");
      isToDateValid = true;
    } else {
      defToDate = moment(to_date).format("YYYY-MM-DD");
      isToDateValid = moment(to_date).isValid();
    }

    if (page_no) {
      page_no = +page_no;
      pageNo = page_no && !isNaN(page_no) ? page_no : pageNo;
    }
    if (page_size) {
      page_size = +page_size;
      pageSize = page_size && !isNaN(page_size) ? page_size : pageNo;
    }

    sortOrder =
      sort_order === "ASC" || sort_order === "DESC" ? sort_order : sortOrder;
    sortField = sort_field ? sort_field : sortField;
    if (
      user_uuid &&
      departmentId &&
      isFromDateValid &&
      isToDateValid &&
      doctor_id
    ) {
      try {
        //
        let mypatientListQuery = {};
        mypatientListQuery.where = emr_utility.getDateQueryBtwColumn(
          "ec_performed_date",
          defFromDate,
          defToDate
        );
        mypatientListQuery.where.ec_doctor_uuid = doctor_id;
        mypatientListQuery.where.d_uuid = departmentId;
        if (searchKey === "pa_pin" || searchKey === "pd_mobile") {
          mypatientListQuery.where[searchKey] = searchValue;
          pageNo = 0;
          pageSize = 10;
        }

        offset = pageNo * pageSize;
        const myPatientList = await VWMyPatientList.findAll({
          offset: offset,
          limit: pageSize,
          order: [[`${sortField}`, `${sortOrder}`]],
          where: mypatientListQuery.where,
          attributes: myPatientlistAttributes.myPatientListAttributes
        });
        const returnMessage =
          myPatientList.length > 0
            ? emr_constants.MY_PATIENT_LIST
            : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: httpStatus.OK,
          message: returnMessage,
          responseContents: getMyPatientListResponseForUIFormat(myPatientList),
          responseLength: myPatientList.length
        });
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex.message });
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

function getMyPatientListSearchQuery(offset, itemsPerPage, sortArr) {
  return {
    subQuery: false,
    offset: offset,
    limit: itemsPerPage,
    order: [sortArr]
  };
}

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
