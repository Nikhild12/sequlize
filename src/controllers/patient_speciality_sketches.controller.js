// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

// EMR Utility Import
const emr_utility = require('../services/utility.service');

// Patient Speciality Sketch Att Import
const patSpeSkeAtt = require('../attributes/patient_speciality_sketch_attributes');

const patientSpecialitySketchesTbl = sequelizeDb.patient_speciality_sketches;
const specialitySketchesTbl = sequelizeDb.speciality_sketches;

const patientSpecalitySketch = () => {

    /**
    * Adding patient SpecalitySketch
    * @param {*} req 
    * @param {*} res 
    */
    const _createPatientSpecalitySketch = async (req, res) => {

        const { user_uuid, facility_uuid } = req.headers;
        let sketch = req.body;

        if (user_uuid) {
            try {

                sketch.is_active = sketch.status = true;
                sketch.created_by = user_uuid;
                sketch.created_date = new Date();
                sketch.facility_uuid = facility_uuid;
                sketch.revision = 1;

                if (Array.isArray(req.files) && req.files[0].path) {
                    sketch.sketch_path = req.files[0].path;
                }

                const sketchData = await patientSpecialitySketchesTbl.create(sketch, { returing: true });
                return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: sketchData });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };

    const _getPrevPatientSpecialitySketch = async (req, res) => {
        const { user_uuid } = req.headers;
        const { patient_uuid } = req.query;

        if (user_uuid && patient_uuid > 0) {
            try {

                const getSpecialitySketchByPId = await patientSpecialitySketchesTbl.findAll({
                    where: { patient_uuid, is_active: emr_constants.IS_ACTIVE, status: emr_constants.IS_ACTIVE },
                    order: [["uuid", "desc"]],
                    limit: 5,
                    attributes: ['uuid', 'patient_uuid', 'facility_uuid', 'department_uuid', 'encounter_uuid', 'speciality_sketch_uuid', 'sketch_path', 'created_date'],
                    include: [{
                        model: specialitySketchesTbl,
                        attributes: ['uuid', 'code', 'name', 'description']
                    }]
                });

                // Code and Message for Response
                const code = emr_utility.getResponseCodeForSuccessRequest(getSpecialitySketchByPId);
                const message = emr_utility.getResponseMessageForSuccessRequest(code, 'pssf');
                const specialityResponse = patSpeSkeAtt.getPatientSpecialitySketchResponse(getSpecialitySketchByPId);
                return res.status(200).send({ code: code, message, responseContents: specialityResponse });


            } catch (error) {
                console.log('Exception happened', ex);
                return res.status(500).send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: ex });
            }
        } else {
            return res.status(400).send({
                code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
            });
        }
    };

    return {

        createPatientSpecalitySketch: _createPatientSpecalitySketch,
        getPrevPatientSpecialitySketch: _getPrevPatientSpecialitySketch
    };
};

module.exports = patientSpecalitySketch();
