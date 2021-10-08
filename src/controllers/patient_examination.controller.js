// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const patient_examination_tbl = sequelizeDb.patient_examinations;

const patient_examination = () => {

    const _create_patient_examination = async (req, res) => {

        if (Object.keys(req.body).length != 0) {

            const { user_uuid } = req.headers;
            const patientExaminationData = req.body;

            if (user_uuid > 0 && patientExaminationData) {

                try {

                    patientExaminationData.status = 1;
                    patientExaminationData.is_active = patientExaminationData.is_active;
                    patientExaminationData.created_by = user_uuid;
                    patientExaminationData.modified_by = user_uuid;

                    patientExaminationData.created_date = new Date();
                    patientExaminationData.modified_date = new Date();
                    patientExaminationData.revision = 1;

                    const patientExaminationCreatedData = await patient_examination_tbl.create(
                        patientExaminationData,
                        { returning: true }
                    );

                    console.log("..>>=========== RETURN ==============>..", patientExaminationCreatedData);

                    if (patientExaminationCreatedData) {
                        patientExaminationData.uuid = patientExaminationCreatedData.uuid;
                        return res.status(200).send({
                            statusCode: 200,
                            message: "Patient examination inserted successfully",
                            responseContents: patientExaminationData
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
        create_patient_examination: _create_patient_examination
    };

}

module.exports = patient_examination();