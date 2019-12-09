
// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

const patient_diagnosis_tbl = sequelizeDb.patient_diagnosis;

const emr_constants = require('../config/constants');


const PatientDiagnsis = () => {

    const _createPatientDiagnosis = async (req, res) => {

        const { user_uuid } = req.headers;
        const patientsDiagnosisData = req.body;

        // checking user id and 
        // req data length
        if (user_uuid && patientsDiagnosisData.length > 0) {


            try {

                // if the bit is not set
                // setting it to `0`
                patientsDiagnosisData.forEach((pD) => {
                    pD.is_snomed = pD.is_snomed || emr_constants.IS_ACTIVE;
                    pD.is_patient_condition = pD.is_patient_condition || emr_constants.IS_ACTIVE;
                    pD.is_chronic = pD.is_chronic || emr_constants.IS_ACTIVE;

                    pD.is_active = pD.status = emr_constants.IS_ACTIVE;

                    pD.created_by = pD.modified_by = pD.performed_by = user_uuid;
                    pD.modified_date = pD.created_date = new Date();
                });

                const patientDiagnosisCreatedData = await patient_diagnosis_tbl.bulkCreate(patientsDiagnosisData, { returning: true });
                if (patientDiagnosisCreatedData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted Patient Diagnosis Complaints Successfully", responseContents: patientsDiagnosisData });

                }

            } catch (ex) {

                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }

    }

    return {
        createPatientDiagnosis: _createPatientDiagnosis
    }
};

module.exports = PatientDiagnsis();