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
  const _getReferralHistory = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_uuid } = req.query;
    try {
      if (user_uuid && patient_uuid) {
        const referralHistory = await vw_patient_referral.findAll({
          limit: 10,
          order: [['pr_uuid', 'DESC']],
          attributes: ['pr_uuid', 'pr_referral_date', 'u_first_name', 'd_uuid', 'd_name', 'f_uuid', 'f_name',],
          where: { pr_patient_uuid: patient_uuid }
        }, { returning: true });
        return res.status(200).send({ code: httpStatus.OK, responseContent: referralHistory });

      }
      else {
        return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
      }
    }
    catch (err) {
      console.log('Exception happened', err);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: err });
    }
  };
  return {
    getReferralHistory: _getReferralHistory
  };

};


module.exports = Referral_History();
