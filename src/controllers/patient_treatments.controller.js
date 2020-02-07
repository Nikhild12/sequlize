// Package Import
const httpStatus = require("http-status");

const moment = require("moment");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");

// Config Import
const config = require("../config/config");

var Sequelize = require("sequelize");
var Op = Sequelize.Op;

// Constants Import
const emr_constants = require("../config/constants");

// Utility Service
const utilityService = require("../services/utility.service");

// tbl
const patientTreatmenttbl = sequelizeDb.patient_treatments;

// Patient Treatment Attributes
const patientTreatmentAttributes = require("../attributes/patient_treatment_attributes");

const PatientTreatmentController = () => {
  const _createPatientTreatment = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patientTreatment } = req.body;
    const { patientDiagnosis, patientPrescription } = req.body;
    const { patientLab, patientradiology, patientInvestigation } = req.body;

    let patientTransaction;
    let patientTransactionStatus = false;
    if (user_uuid && patientTreatment) {
      if (patientTreatmentAttributes.checkPatientTreatmentBody(req)) {
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST,
          message: emr_constants.TREATMENT_REQUIRED
        });
      }

      let patientDgnsCreatedData;
      let prescriptionCreated, labCreated;
      try {
        // transaction Initialization
        patientTransaction = await sequelizeDb.sequelize.transaction();

        patientTreatment.treatment_given_by = user_uuid;
        patientTreatment.treatment_given_date = new Date();
        const patientTKCreatedData = await patientTreatmenttbl.create(
          patientTreatment,
          {
            returning: true,
            transaction: patientTransaction
          }
        );

        if (Array.isArray(patientDiagnosis) && patientDiagnosis.length > 0) {
          patientDiagnosis.forEach(p => {
            p.is_snomed = p.is_snomed || emr_constants.IS_ACTIVE;
            p.is_patient_condition =
              p.is_patient_condition || emr_constants.IS_ACTIVE;
            p.is_chronic = p.is_chronic || emr_constants.IS_ACTIVE;
            p = utilityService.assignDefaultValuesAndUUIdToObject(
              p,
              patientTKCreatedData,
              user_uuid,
              "patient_treatment_uuid"
            );
          });
          patientDgnsCreatedData = await patientDiagnosisTbl.bulkCreate(
            patientDiagnosis,
            {
              returning: true,
              transaction: patientTransaction,
              validate: true
            }
          );
        }
        if (
          patientTreatmentAttributes.isPrescriptionAvailable(
            patientPrescription
          )
        ) {
          patientPrescription.header.patient_treatment_uuid =
            patientTKCreatedData.uuid;
          prescriptionCreated = await patientTreatmentAttributes.createPrescriptionHelper(
            req.headers,
            patientPrescription
          );
        }

        if (patientTreatmentAttributes.isLabAvailable(patientLab)) {
          patientLab.header.patient_treatment_uuid = patientTKCreatedData.uuid;
          labCreated = await patientTreatmentAttributes.createLabHelper(
            req.headers,
            patientLab
          );
        }

        await patientTransaction.commit();
        patientTransactionStatus = true;
        return res.status(200).send({
          code: httpStatus.OK,
          message: emr_constants.INSERTED_PATIENT_TREATMENT,
          responseContents: {
            patientTKCreatedData,
            prescriptionCreated,
            labCreated
          }
        });
      } catch (error) {
        console.log(error);

        if (patientTransaction) {
          await patientTransaction.rollback();
          patientTransactionStatus = true;
        }

        console.log(labCreated);

        if (labCreated && labCreated.responseContents) {
          const labResponse = labCreated.responseContents;
          const id =
            labResponse.length && labResponse.length > 0
              ? labResponse[0].uuid
              : labResponse.uuid;
          await patientTreatmentAttributes.createLabHelper(id);
        }
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: error });
      } finally {
        if (patientTransaction && !patientTransactionStatus) {
          patientTransaction.rollback();
        }
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };
  return {
    createPatientTreatment: _createPatientTreatment
  };
};

module.exports = PatientTreatmentController();
