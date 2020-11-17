// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');


const patientReferralTbl = sequelizeDb.patient_referral;
const vw_patient_referral = sequelizeDb.vw_patient_referral_history;


const Referral_History = () => {

  /**
   * getReferralHistory
   * @param {*} req 
   * @param {*} res 
   */

  const _getReferralHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid, facility_uuid, department_uuid } = req.query;
    try {
      if (user_uuid && patient_uuid) {
        const referralHistory = await getReferralData(patient_uuid, facility_uuid, department_uuid);
        return res.status(200).send({ code: httpStatus.OK, message: 'Fetched Successfully', responseContent: referralHistory });

      } else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
      }
    }
    catch (err) {
      console.log('Exception happened', err);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: err });
    }
  };

  /**
    * Adding Patient References
    * @param {*} req 
    * @param {*} res 
    */
  const _createPatientReferral = async (req, res) => {
    const { user_uuid } = req.headers;
    let patientReferralData = req.body;

    try {
      if (!user_uuid && !patientReferralData) {
        return res.status(404).send({ code: httpStatus.NOT_FOUND, message: `${emr_constants.NO} ${emr_constants.user_uuid} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
      }
      await assignDefault(patientReferralData, user_uuid);
      await patientReferralTbl.create(patientReferralData, { returning: true });
      return res.status(200).send({ code: httpStatus.OK, message: 'Inserted Success' });
    } catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  };

  const _updatePatientReferral = async (req, res) => {
    try {
      const { patient_referral_uuid } = req.body;
      if (!patient_referral_uuid) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .send({
            status: 'error',
            code: httpStatus.UNPROCESSABLE_ENTITY,
            message: 'patient_referral_uuid is required'
          });
      }

      let data = await patientReferralTbl.update({ is_reviewed: 1 },
        { where: { uuid: patient_referral_uuid } });
      return res
        .status(httpStatus.OK)
        .send({
          status: 'success',
          code: httpStatus.OK,
          responseContent: data,
          message: 'Updated Successfully'
        });

    } catch (ex) {
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
  }

  return {
    getReferralHistory: _getReferralHistory,
    createPatientReferral: _createPatientReferral,
    updatePatientReferral: _updatePatientReferral
  };

};


module.exports = Referral_History();

async function assignDefault(patientReferralData, user_uuid) {
  patientReferralData.is_active = patientReferralData.status = true;
  patientReferralData.created_by = patientReferralData.modified_by = user_uuid;
  patientReferralData.created_date = patientReferralData.modified_date = new Date();
  patientReferralData.revision = 1;
  patientReferralData.referred_by = user_uuid;
  return patientReferralData;
}

async function getReferralData(patient_uuid, facility_uuid, department_uuid) {
  let findQuery = {
    attributes: ['pr_uuid', 'pr_referral_date', 'u_first_name', 'u_middle_name', 'u_last_name', 'pr_facility_uuid', 'pr_department_uuid', 'd_uuid', 'd_name', 'pr_referral_deptartment_uuid', 'rd_name', 'f_uuid', 'f_name', 'rf_name'],
    where: {},
    order: [['pr_uuid', 'DESC']],
    limit: 10
  };

  if (patient_uuid && /\S/.test(patient_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      pr_patient_uuid: patient_uuid
    })
  }

  if (facility_uuid && /\S/.test(facility_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      pr_facility_uuid: facility_uuid
    })
  }

  if (department_uuid && /\S/.test(department_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      pr_department_uuid: department_uuid
    })
  }

  return vw_patient_referral.findAll(findQuery, { returning: true });
}
