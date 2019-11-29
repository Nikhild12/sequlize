// Package Import
const httpStatus = require("http-status");
const moment = require('moment');

// Sequelizer Import
var Sequelize = require('sequelize');
var Op = Sequelize.Op;

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

const encounter_tbl = sequelizeDb.encounter;
const encounter_doctors_tbl = sequelizeDb.encounter_doctors;

const emr_constants = require('../config/constants');

// Query
function getActiveEncounterQuery(pId, dId) {
    return {
        where: {
            patient_uuid: pId,
            [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col('encounter_date')), '<=', moment().format('YYYY-MM-DD'))
            ],
            is_active_encounter: emr_constants.IS_ACTIVE,
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE
        },
        include: [
            {
                model: encounter_doctors_tbl,
                attributes: ['uuid', 'doctor_uuid'],
                where: {
                    doctor_uuid: dId,
                    is_active: emr_constants.IS_ACTIVE,
                    status: emr_constants.IS_ACTIVE
                }
            },
        ]
    }
}

const Encounter = () => {

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    const _getEncounterByDocAndPatientId = async (req, res) => {

        const { user_uuid } = req.headers;
        const { patientId, doctorId } = req.query;

        if (user_uuid && patientId && doctorId) {

            try {

                const encounterData = await encounter_tbl.findAll(getActiveEncounterQuery(patientId, doctorId));
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched Encounter Successfully", responseContents: encounterData });

            } catch (ex) {

                console.log(ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
        }
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    const _createPatientEncounter = async (req, res) => {
        const { user_uuid } = req.headers;
        const { encounter, encounterDoctor } = req.body;

        if (user_uuid && encounter && encounterDoctor) {

            // Assigning
            encounter.modified_by = encounter.created_by = user_uuid;
            encounter.is_active = encounter.status = emr_constants.IS_ACTIVE;
            encounter.created_date = encounter.modified_date = new Date();
            encounter.encounter_date = new Date();

            // Assigning
            encounterDoctor.modified_by = encounterDoctor.created_by = user_uuid;
            encounterDoctor.is_active = encounterDoctor.status = emr_constants.IS_ACTIVE;
            encounterDoctor.created_date = encounterDoctor.modified_date = encounterDoctor.consultation_start_date = new Date();

            try {
                const createdEncounterData = await encounter_tbl.create(encounter, { returning: true });

                if (createdEncounterData) {
                    encounter.uuid = encounterDoctor.encounter_uuid = createdEncounterData.uuid;

                    const createdEncounterDoctorData = await encounter_doctors_tbl.create(encounterDoctor, { returning: true });
                    encounterDoctor.uuid = createdEncounterDoctorData.uuid;

                    return res.status(200).send({ code: httpStatus.OK, message: "Inserted Encounter Successfully", responseContents: { encounter, encounterDoctor } });
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

        getEncounterByDocAndPatientId: _getEncounterByDocAndPatientId,
        createPatientEncounter: _createPatientEncounter

    }
}

module.exports = Encounter();