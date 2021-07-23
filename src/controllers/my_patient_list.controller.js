// Package Import
const httpStatus = require("http-status");
const moment = require("moment");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const VWMyPatientList = sequelizeDb.vw_my_patient_list;

// Constant Serivce
const emr_constants = require("../config/constants");

// Utility Service
const emr_utility = require("../services/utility.service");

const myPatientlistAttributes = require("../attributes/my_patient_list");


const MyPatientListController = () => {
  const _getMyPatientListByFilters = async (req, res) => {
    const { user_uuid } = req.headers;
    let { departmentId, from_date, to_date, doctor_id } = req.body;
    let { pageNo, paginationSize, sortOrder, sortField } = req.body;
    const rBody = req.body;
    let offset;
    let isFromDateValid, isToDateValid, defFromDate, defToDate;

    // Bug-H30-40610 - My Patient list not loading - Start
    // Checking From Date
    defFromDate = emr_utility.indiaTz(from_date).format('YYYY-MM-DD');
    isFromDateValid = emr_utility.checkDateValid(from_date);

    // Checking To date
    defToDate = emr_utility.indiaTz(to_date).format('YYYY-MM-DD');
    isToDateValid = emr_utility.checkDateValid(to_date);
    // Bug-H30-40610 - My Patient list not loading - End

    // Checking Page Size and No
    pageNo = pageNo && !isNaN(+(pageNo)) ? pageNo : 0;
    paginationSize = paginationSize && !isNaN(+(paginationSize)) ? paginationSize : 10;

    // Checking Sort field and order
    sortField = sortField && sortField === 'modified_date' ? 'ec_performed_date' : sortField;
    sortOrder = sortOrder ? sortOrder : 'DESC';
    if (
      user_uuid && isFromDateValid && isToDateValid && doctor_id && departmentId) {
      try {
        // 
        let mypatientListQuery = {
          where: {}
        };

        // Bug-H30-40610 - My Patient list not loading - Start
        mypatientListQuery.where.ec_performed_date = {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('DATE', Sequelize.col('ec_performed_date')), '>=', defFromDate),
            Sequelize.where(Sequelize.fn('DATE', Sequelize.col('ec_performed_date')), '<=', defToDate)
          ]
        }
        // mypatientListQuery.where = emr_utility.comparingDateAndTime("ec_performed_date", defFromDate, defToDate);
        // Bug-H30-40610 - My Patient list not loading - End

        mypatientListQuery.where.ec_doctor_uuid = +(doctor_id);
        mypatientListQuery.where.d_uuid = +(departmentId);

        mypatientListQuery.where = getSearchValue(rBody, mypatientListQuery.where);


        offset = pageNo * paginationSize;
        const myPatientList = await VWMyPatientList.findAndCountAll({
          offset: offset,
          limit: paginationSize,
          order: [[`${sortField}`, `${sortOrder}`]],
          where: mypatientListQuery.where,
          attributes: myPatientlistAttributes.myPatientListAttributes
        });

        return res.status(200).send({
          code: httpStatus.OK,
          message: myPatientList && myPatientList.rows.length > 0 ? emr_constants.MY_PATIENT_LIST : emr_constants.NO_RECORD_FOUND,
          responseContents: myPatientList ? myPatientList.rows : [],
          responseLength: myPatientList ? myPatientList.length : 0,
          totalRecords: myPatientList ? myPatientList.count : 0
        });

      } catch (ex) {
        return res
          .status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
      }

    } else {
      // offset;
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


const getSearchValue = (object, target) => {
  if (object.hasOwnProperty('pd_mobile')) {
    target['pd_mobile'] = object['pd_mobile'];
  } else if (object.hasOwnProperty('pd_pin')) {
    target['pa_pin'] = object['pd_pin'];
  } else if (object.hasOwnProperty('p_old_pin')) {
    target['p_old_pin'] = object['p_old_pin'];
  } else {
    return target;
  }
  return target;
};