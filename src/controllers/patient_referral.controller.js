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
    const {
      user_uuid
    } = req.headers;
    const {
      patient_uuid,
      facility_uuid,
      department_uuid,
      is_reviewed
    } = req.query;
    try {
      if (user_uuid && patient_uuid) {
        const referralHistory = await getReferralData(patient_uuid, facility_uuid, department_uuid, is_reviewed);
        return res.status(200).send({
          code: httpStatus.OK,
          message: 'Fetched Successfully',
          responseContent: referralHistory
        });

      } else {
        return res.status(400).send({
          code: httpStatus.UNAUTHORIZED,
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (err) {
      console.log('Exception happened', err);
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: err
      });
    }
  };

  const _getPatientReferral = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    const {
      patient_uuid,
      referral_facility_uuid,
      referral_deptartment_uuid,
      is_reviewed,
      facility_uuid,
      department_uuid,
      referral_type_uuid,
      ward_uuid
    } = req.query;
    try {
      if (user_uuid && patient_uuid) {
        const referralHistory = await getPatientReferralData(patient_uuid, referral_type_uuid, referral_facility_uuid, referral_deptartment_uuid, is_reviewed, facility_uuid, department_uuid, ward_uuid);
        return res.status(200).send({
          code: httpStatus.OK,
          message: 'Fetched Successfully',
          responseContent: referralHistory
        });

      } else {
        return res.status(400).send({
          code: httpStatus.UNAUTHORIZED,
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (err) {
      console.log('Exception happened', err);
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: err
      });
    }
  };
  /**
   * Adding Patient References
   * @param {*} req 
   * @param {*} res 
   */
  const _createPatientReferral = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    let patientReferralData = req.body;

    let { patient_uuid,
      referral_facility_uuid,
      referral_deptartment_uuid } = req.body;
      
    try {
      if (!user_uuid && !patientReferralData) {
        return res.status(404).send({
          code: httpStatus.NOT_FOUND,
          message: `${emr_constants.NO} ${emr_constants.user_uuid} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
        });
      }


      const referralHistory = await getPatientReferralData(patient_uuid, '', referral_facility_uuid, referral_deptartment_uuid, is_reviewed = false, '', '', '');
      if (referralHistory) {
        return res.status(409).send({
          code: httpStatus.CONFLICT,
          message: 'Duplicate found',
          responseContent: referralHistory
        });
      }

      await assignDefault(patientReferralData, user_uuid);
      let data = await patientReferralTbl.create(patientReferralData, {
        returning: true
      });
      return res.status(200).send({
        code: httpStatus.OK,
        message: 'Inserted Success',
        responseContent: data
      });
    } catch (ex) {
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  const _updatePatientReferral = async (req, res) => {
    try {
      const {
        patient_referral_uuid
      } = req.body;
      const postData = req.body;
      if (!patient_referral_uuid) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .send({
            status: 'error',
            code: httpStatus.UNPROCESSABLE_ENTITY,
            message: 'patient_referral_uuid is required'
          });
      }

      postData.is_reviewed = 1;
      if (postData.is_admitted) { //This Condition is for IP Management, If Patient admitted the we are setting this flag as true
        postData.is_admitted = 1
      }

      let data = await patientReferralTbl.update(postData,
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
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  const _updatePatientIsAdmitted = async (req, res) => {
    try {
      const {
        patient_referral_uuid
      } = req.body;
      const postData = req.body;
      if (!patient_referral_uuid) {
        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .send({
            status: 'error',
            code: httpStatus.UNPROCESSABLE_ENTITY,
            message: 'patient_referral_uuid is required'
          });
      }

      postData.is_admitted = 1;

      let data = await patientReferralTbl.update(postData,
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
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }
  };

  return {
    getReferralHistory: _getReferralHistory,
    getPatientReferral: _getPatientReferral,
    createPatientReferral: _createPatientReferral,
    updatePatientReferral: _updatePatientReferral,
    updatePatientIsAdmitted: _updatePatientIsAdmitted
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

async function getReferralData(patient_uuid, facility_uuid, department_uuid, is_reviewed) {
  let findQuery = {
    attributes: ['pr_uuid', 'pr_referral_date', 'u_first_name', 'u_middle_name', 'u_last_name', 'pr_facility_uuid', 'pr_department_uuid', 'd_uuid', 'd_name', 'pr_referral_deptartment_uuid', 'rd_name', 'f_uuid', 'f_name', 'rf_name'],
    where: {},
    order: [
      ['pr_uuid', 'DESC']
    ],
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

  if (is_reviewed && /\S/.test(is_reviewed)) {
    findQuery.where = Object.assign(findQuery.where, {
      pr_is_reviewed: is_reviewed
    })
  }

  return vw_patient_referral.findAll(findQuery, {
    returning: true
  });
}

async function getPatientReferralData(patient_uuid, referral_type_uuid, referral_facility_uuid, referral_deptartment_uuid, is_reviewed, facility_uuid, department_uuid, ward_uuid) {
  let findQuery = {
    where: {
      is_reviewed: getBoolean(is_reviewed)
    },
  };

  if (patient_uuid && /\S/.test(patient_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      patient_uuid: patient_uuid
    })
  }

  if (referral_facility_uuid && /\S/.test(referral_facility_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      referral_facility_uuid: referral_facility_uuid
    })
  }

  if (referral_type_uuid && /\S/.test(referral_type_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      referral_type_uuid: referral_type_uuid
    })
  }

  if (referral_deptartment_uuid && /\S/.test(referral_deptartment_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      referral_deptartment_uuid: referral_deptartment_uuid
    })
  }

  if (facility_uuid && /\S/.test(facility_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      facility_uuid: facility_uuid
    })
  }

  if (department_uuid && /\S/.test(department_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      department_uuid: department_uuid
    })
  }

  if (ward_uuid && /\S/.test(ward_uuid)) {
    findQuery.where = Object.assign(findQuery.where, {
      ward_uuid: ward_uuid
    })
  }

  const patientData = await patientReferralTbl.findOne(findQuery);
  return patientData;
}

function getBoolean(booleanValue) {
  switch (booleanValue) {
    case '':
      return false;
    case 'true':
      return true;
    case true:
      return true;
    case 'false':
      return false;
    case false:
      return false;
    default:
      return false;
  }
}