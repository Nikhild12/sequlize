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
    const {
      user_uuid
    } = req.headers;
    let patientTransferData = req.body;
    try {
      if (!user_uuid && patientTransferData) {
        return res.status(404).send({
          code: httpStatus.NOT_FOUND,
          message: `${emr_constants.NO} ${emr_constants.user_uuid} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
        });
      }
      if (!(patientTransferData.transfer_reason_uuid||patientTransferData.transfer_comments)) {
        throw {
          error_type: "validation",
          message: "please provide transfer_reason_uuid or transfer_comments"
        };
      }
      const notesData = await patientTransferTbl.findOne({
        where: {
          patient_uuid: patientTransferData.patient_uuid,
          transfer_ward_uuid: patientTransferData.transfer_ward_uuid
        }
      }, {
        returning: true
      });
      if (notesData) {
        throw {
          error_type: "validation",
          message: "patient already transferred to this selected ward"
        };
      }
      await assignDefault(patientTransferData, user_uuid);
      const data = await patientTransferTbl.create(patientTransferData, {
        returning: true
      });
      return res.status(200).send({
        code: httpStatus.OK,
        message: 'Inserted Success',
        responseContents: data
      });
    } catch (ex) {
      console.log('Exception Happened');
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }

  };

  const updatePatientTransfer = async (req, res) => {
    const {
      user_uuid
    } = req.headers;
    let patientTransferData = req.body.updatePT;
    try {
      if (!user_uuid && patientTransferData) {
        return res.status(404).send({
          code: httpStatus.NOT_FOUND,
          message: `${emr_constants.NO} ${emr_constants.user_uuid} ${emr_constants.FOUND} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
        });
      }
      if (!(patientTransferData.transfer_reason_uuid||patientTransferData.transfer_comments)) {
        throw {
          error_type: "validation",
          message: "please provide transfer_reason_uuid or transfer_comments"
        };
      }
      for (let i = 0; i < patientTransferData.length; i++) {
        const element = patientTransferData[i];
        await patientTransferTbl.update(element, {
          where: {
            uuid: element.Id
          }
        }, {
          returning: true
        });
      }

      return res.status(200).send({
        code: httpStatus.OK,
        message: 'Update Success'
      });
    } catch (ex) {
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex.message
      });
    }

  };

  const _getPatientTransferByPatientId = async (req, res) => {

    const {
      patient_uuid
    } = req.query;
    const {
      user_uuid
    } = req.headers;

    try {
      if (user_uuid && patient_uuid) {
        const notesData = await patientTransferTbl.findAll({
          where: {
            patient_uuid: patient_uuid,
            ward_transfer_status_uuid: {
              [Op.in]: [1, 2]
            }
          }
        }, {
          returning: true
        });
        if (!notesData) {
          return res.status(404).send({
            code: 404,
            message: emr_constants.NO_RECORD_FOUND
          });
        }
        return res.status(200).send({
          code: httpStatus.OK,
          responseContent: notesData
        });
      } else {
        return res.status(400).send({
          code: httpStatus.UNAUTHORIZED,
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (ex) {
      console.log('Exception happened', ex);
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: ex
      });
    }
  };

  return {
    addPatientTransfer: _addPatientTransfer,
    updatePatientTransfer,
    getPatientTransferByPatientId: _getPatientTransferByPatientId
  };

};
module.exports = Patient_Transfer();

async function assignDefault(patientTransferData, user_uuid) {
  patientTransferData.is_active = patientTransferData.status = true;
  patientTransferData.created_by = patientTransferData.modified_by = user_uuid;
  patientTransferData.created_date = patientTransferData.modified_date = new Date();
  patientTransferData.revision = 1;
  patientTransferData.referred_by = user_uuid;
  return patientTransferData;
}