//Package import 
const httpStatus = require('http-status');
const moment = require('moment');
var Sequelize = require('sequelize');
//Sequlize Import 
const sequelizeDb = require('../config/sequelize');
var Op = Sequelize.Op;
const emr_utility = require('../services/utility.service');

//Intialize Tables
const patient_chief_complaints_tbl = sequelizeDb.patient_chief_complaints;
const chief_complaints_tbl = sequelizeDb.chief_complaints;
const patient_diagnosis_tbl = sequelizeDb.patient_diagnosis;
const diagnosis_tbl = sequelizeDb.diagnosis;


const emr_constants = require("../config/constants");

const EmrDashBoard = () => {
  /**
   * @param {*} req
   * @param {*} res
   */


  const _getDashBoard = async (req, res) => {
    const { user_uuid } = req.headers;
    const { doctorId, depertmentId, from_date, to_date } = req.query;

    let filterQuery = {
      encounter_doctor_uuid: doctorId,
      status: emr_constants.IS_ACTIVE,
      is_active: emr_constants.IS_ACTIVE,
      department_uuid: depertmentId,

    };
    if (!user_uuid) {
      return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
    }
    try {

      const topComplaints = await getTopComplaints(filterQuery, Sequelize);
      const topDiagnosis = await getTopDiagnosis(filterQuery, Sequelize);
      return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContents: { "TopComplaints": topComplaints, "TopDiagnosis": topDiagnosis } });
    } catch (ex) {
      console.log('Exception Happned', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  };
  return {
    getDashBoard: _getDashBoard
  };
};

module.exports = EmrDashBoard();
async function getTopComplaints(filterQuery, Sequelize) {
  return patient_chief_complaints_tbl.findAll({
    include: [{
      model: chief_complaints_tbl,
      attributes: ['uuid', 'name'],
    }],
    where: filterQuery,
    group: ['chief_complaint_uuid'],
    attributes: ['uuid', 'encounter_doctor_uuid', 'chief_complaint_uuid',
      [Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('chief_complaint_uuid')), 'DESC']],
    limit: 10
  });

}

async function getTopDiagnosis(filterQuery, Sequelize) {
  return patient_diagnosis_tbl.findAll({
    include: [{
      model: diagnosis_tbl,
      attributes: ['code', 'name'],
    }],
    where: filterQuery,
    require: false,
    group: ['diagnosis_uuid'],
    attributes: ['diagnosis_uuid', 'encounter_doctor_uuid',
      [Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'Count']
    ],
    order: [[Sequelize.fn('COUNT', Sequelize.col('diagnosis_uuid')), 'DESC']],
    limit: 10

  });
}