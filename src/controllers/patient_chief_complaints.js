// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Initialize EMR Workflow
const patient_chief_complaints = sequelizeDb.patient_chief_complaints;

const emr_constants = require('../config/constants');

const PatientChiefComplaints = () => {


    const _createChiefComplaints = async (req, res) => {


        const { user_uuid } = req.headers;
        const chiefComplaintsData = req.body;

        if (chiefComplaintsData && chiefComplaintsData.length > 0 && user_uuid) {

            chiefComplaintsData.forEach((cD) => {
                cD.is_active = cD.status = emr_constants.is_active;
                cD.created_date = cD.modified_date = cD.performed_date = new Date().toISOString();
                cD.modified_by = cD.created_by = cD.performed_by = user_uuid;
            });

            try {
                const chiefComplaintsCreatedData = await patient_chief_complaints.bulkCreate(chiefComplaintsData, { returning: true });

                if (chiefComplaintsCreatedData) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted Patient Chief Complaints Successfully", responseContents: attachUUIDTOCreatedData(chiefComplaintsData, chiefComplaintsCreatedData) });
                }
            } catch (ex) {
                return res.status(200).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No User Id Found" });
        }
    }

    return {

        createChiefComplaints: _createChiefComplaints
    }
}

module.exports = PatientChiefComplaints();

function attachUUIDTOCreatedData(reqData, createdData) {
    reqData.forEach((rD, idx) => {
        rD.uuid = createdData[idx].uuid;
    });

    return reqData;
}