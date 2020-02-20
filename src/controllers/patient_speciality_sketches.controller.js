// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');
const patientSpecialitySketchesTbl = sequelizeDb.patient_speciality_sketches;

const patientSpecalitySketch = () => {

    /**
    * Adding patient SpecalitySketch
    * @param {*} req 
    * @param {*} res 
    */
    const _createPatientSpecalitySketch = async (req, res) => {

        const { user_uuid } = req.headers;
        let sketch = req.body;

        if (user_uuid) {

            sketch.is_active = sketch.status = true;
            sketch.created_by = sketch.modified_by = user_uuid;
            sketch.created_date = sketch.modified_date = new Date();
            sketch.revision = 1;

            try {
                const sketchData = await patientSpecialitySketchesTbl.create(sketch, { returing: true });
                return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: sketch });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };

    return {


        createPatientSpecalitySketch: _createPatientSpecalitySketch

    };
};

module.exports = patientSpecalitySketch();
