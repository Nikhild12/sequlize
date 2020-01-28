// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

// Table Import

const patientTransferTbl = sequelizeDb.patient_transfer;

const Patient_Transfer = () => {

  /**
     * Adding Patient Transfer Details
     * @param {*} req 
     * @param {*} res 
     */
  const _addPatientTransfer = async (req, res) => {
    const { user_uuid } = req.headers;
    let patientTransferData = req.body;
    try {
      if (!user_uuid && patientTransferData) {
        return res.status(404).send({ code: httpStatus.NOT_FOUND, message: `${emr_constants.NO} ${emr_constants.user_uuid} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
      }
      await assignDefault(patientTransferData, user_uuid);
      await patientTransferTbl.create(patientReferralData, { returning: true });
      return res.status(200).send({ code: httpStatus.OK, message: 'Inserted Success' });
    } catch (ex) {
      console.log('Exception Happened');
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }

  };

  return {
    addPatientTransfer: _addPatientTransfer
  };

};
module.exports = Patient_Transfer();

async function assignDefault(patientReferralData, user_uuid) {
  patientReferralData.is_active = patientReferralData.status = true;
  patientReferralData.created_by = patientReferralData.modified_by = user_uuid;
  patientReferralData.created_date = patientReferralData.modified_date = new Date();
  patientReferralData.revision = 1;
  patientReferralData.referred_by = user_uuid;
  return patientReferralData;
}
