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
    let { departmentId, from_date, to_date, doctor_id, pa_pin, pd_mobile } = req.body;
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
        if (user_uuid && isFromDateValid && isToDateValid && doctor_id && departmentId && pd_mobile) {
          mypatientListQuery.where.pd_mobile = +(pd_mobile);
        } else if (user_uuid && isFromDateValid && isToDateValid && doctor_id && departmentId && pa_pin) {
          mypatientListQuery.where.pa_pin = +(pa_pin);
        } else {

        }
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

  /**H30-49671 - OP EMR - My Patient List - Elumalai Govindan - Start */
  const _getMyOPPatientList = async (req, res) => {
    try {
      let {
        departmentId,
        doctor_id,
        from_date,
        pageNo,
        paginationSize,
        to_date,
        pd_mobile,
        pd_pin,
        p_old_pin
      } = req.body

      const { facility_uuid, user_uuid, authorization } = req.headers;

      if (!doctor_id) {
        return res.send({ status: 'error', statusCode: 422, message: 'Doctor Id required' })
      }
      if (!departmentId) {
        return res.send({ status: 'error', statusCode: 422, message: 'Department Id required' })
      }
      let isFromDateValid, isToDateValid, defFromDate, defToDate;
      let offset;

      pageNo = pageNo && !isNaN(+(pageNo)) ? pageNo : 0;
      paginationSize = paginationSize && !isNaN(+(paginationSize)) ? paginationSize : 10;
      offset = pageNo * paginationSize;

      defFromDate = emr_utility.indiaTz(from_date).format('YYYY-MM-DD');
      isFromDateValid = emr_utility.checkDateValid(from_date);

      defToDate = emr_utility.indiaTz(to_date).format('YYYY-MM-DD');
      isToDateValid = emr_utility.checkDateValid(to_date);

      if (!isFromDateValid || !isToDateValid) {
        return res.send({ status: 'error', statusCode: 422, message: 'Date not valid' })
      }

      let qry = 'SELECT oecc.encounter_department_uuid, d.name AS diagnosis_name, oecc.encounter_doctor_uuid, pd.encounter_uuid, oecc.patient_uuid, oecc.patient_pin_no, oecc.patient_name, oecc.age, oecc.gender_uuid, oecc.mobile, oecc.encounter_date FROM encounter_doctors ed JOIN op_emr_census_count oecc ON ed.doctor_uuid = oecc.encounter_doctor_uuid JOIN patient_diagnosis pd ON ed.patient_uuid = pd.patient_uuid JOIN diagnosis d ON pd.diagnosis_uuid = d.uuid WHERE pd.diagnosis_uuid IS NOT NULL ';

      if (pd_mobile) {
        qry += ' AND oecc.mobile=:pd_mobile '
      } else if (pd_pin) {
        qry += ' AND oecc.patient_pin_no=:pd_pin '
      }

      if (doctor_id) {
        qry += ' AND oecc.encounter_doctor_uuid=:doctor_id '
      }

      if (departmentId) {
        qry += ' AND oecc.encounter_department_uuid=:departmentId '
      }

      if (facility_uuid) {
        qry += ' AND oecc.facility_uuid=:facility_uuid ';
      }

      if (from_date && to_date) {
        qry += ' AND oecc.encounter_date BETWEEN :fromDate AND :toDate'
      }

      qry += ' ORDER BY oecc.encounter_date DESC LIMIT ' + offset + ', ' + paginationSize

      const dataJson = {
        facility_uuid: facility_uuid,
        fromDate: defFromDate,
        toDate: defToDate,
        pd_pin: pd_pin,
        doctor_id: doctor_id,
        departmentId: departmentId
      }

      const myPatientList = await sequelizeDb.sequelize.query(qry, { replacements: dataJson, type: Sequelize.QueryTypes.SELECT });

      return res.status(200).send({
        code: httpStatus.OK,
        message: myPatientList && myPatientList.length > 0 ? emr_constants.MY_PATIENT_LIST : emr_constants.NO_RECORD_FOUND,
        responseContents: myPatientList ? myPatientList : [],
        responseLength: myPatientList ? myPatientList.length : 0,
        totalRecords: myPatientList ? myPatientList.count : 0
      });

    } catch (ex) {
      return res
        .status(400).send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: ex.message });
    }
  }
  /**H30-49671 - OP EMR - My Patient List - Elumalai Govindan - End */
  return {
    getMyPatientListByFilters: _getMyPatientListByFilters,
    getMyOPPatientList: _getMyOPPatientList /**H30-49671 - OP EMR - My Patient List - Elumalai Govindan*/
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