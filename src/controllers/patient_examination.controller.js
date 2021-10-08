// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const patient_examination_tbl = sequelizeDb.patient_examinations;

const patient_examination = () => {

    const _create_patient_examination = async (req, res) => {

        const { user_uuid } = req.headers;
        const patientExaminationData = req.body;

        if (user_uuid > 0 && patientExaminationData) {

            try {
                patientExaminationData.forEach(exD => {
                    exD.status = 1;
                    exD.is_active = 1;
                    exD.created_by = user_uuid;
                    exD.modified_by = user_uuid;

                    exD.created_date = new Date();
                    exD.modified_date = new Date();
                    exD.revision = 1;
                });

                const patientExaminationCreatedData = await patient_examination_tbl.bulkCreate(
                    patientExaminationData,
                    { returning: true }
                );

                if (patientExaminationCreatedData) {
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
    }

    return {
        create_patient_examination: _create_patient_examination
    };

}

module.exports = patient_examination();