// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const patient_history_tbl = sequelizeDb.patient_history;

const patient_history = () => {

    const _create_patient_history = async (req, res) => {

        if (Object.keys(req.body).length != 0) {

            const { user_uuid } = req.headers;
            const patientHistoryData = req.body;

            if (user_uuid > 0 && patientHistoryData) {

                try {

                    patientHistoryData.status = 1;
                    patientHistoryData.is_active = patientHistoryData.is_active;
                    patientHistoryData.created_by = user_uuid;
                    patientHistoryData.modified_by = user_uuid;

                    patientHistoryData.created_date = new Date();
                    patientHistoryData.modified_date = new Date();
                    patientHistoryData.revision = 1;

                    const patientHistoryCreatedData = await patient_history_tbl.create(
                        patientHistoryData,
                        { returning: true }
                    );

                    if (patientHistoryCreatedData) {
                        patientHistoryData.uuid = patientHistoryCreatedData.uuid;
                        return res.status(200).send({
                            statusCode: 200,
                            message: "Patient history inserted successfully",
                            responseContents: patientHistoryData
                        });
                    }

                } catch (ex) {
                    console.log(ex.message);
                    return res.status(400).send({ statusCode: 400, message: ex.message });
                }
            } else {
                return res
                    .status(400)
                    .send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } else {
            return res
                .status(400)
                .send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    }

    return {
        create_patient_history: _create_patient_history
    };

}

module.exports = patient_history();