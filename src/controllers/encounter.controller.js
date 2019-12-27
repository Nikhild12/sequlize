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
const encounter_type_tbl = sequelizeDb.encounter_type;

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
    };
}





const Encounter = () => {

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    const _getEncounterByDocAndPatientId = async (req, res) => {

        const { user_uuid } = req.headers;
        const { patientId, doctorId, from_date, to_date } = req.query;

        try {
            if (user_uuid && patientId && doctorId == 0 && from_date && to_date) {
                const encounterData = await encounter_tbl.findAll(getEncounterQuery(patientId, from_date, to_date));
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched Encounter Successfully", responseContents: encounterData });
            }
            else if (user_uuid && (patientId && patientId > 0) && (doctorId && doctorId > 0)) {

                const encounterData = await encounter_tbl.findAll(getActiveEncounterQuery(patientId, doctorId));
                return res.status(200).send({ code: httpStatus.OK, message: "Fetched Encounter Successfully", responseContents: encounterData });

            } else {
                return res.status(400).send({ code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
            }
        } catch (ex) {

            console.log(ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

        }
    };

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    const _createPatientEncounter = async (req, res) => {
        const { user_uuid } = req.headers;
        const { encounter, encounterDoctor } = req.body;
        let encounterPromise = [];
        if (user_uuid && encounter && encounterDoctor) {

            const { encounter_type_uuid, patient_uuid } = encounter;

            // Assigning
            encounter.modified_by = encounter.created_by = user_uuid;
            encounter.is_active = encounter.status = encounter.is_active_encounter = emr_constants.IS_ACTIVE;
            encounter.created_date = encounter.modified_date = new Date();
            encounter.encounter_date = new Date();

            // Assigning
            encounterDoctor.modified_by = encounterDoctor.created_by = user_uuid;
            encounterDoctor.patientId = encounter.patientId;
            encounterDoctor.is_active = encounterDoctor.status = emr_constants.IS_ACTIVE;
            encounterDoctor.created_date = encounterDoctor.modified_date = encounterDoctor.consultation_start_date = new Date();

            try {

                // if Encounter Type is 2 then check
                // for active encounter for type 1 if exists
                // closing it

                const encounterData = await encounter_tbl.findAll(getActiveEncounterQuery(patient_uuid, user_uuid));
                if (encounter_type_uuid === 2) {
                    if (encounterData && encounterData.length > 0) {

                        encounterPromise = [...encounterPromise,
                        encounter_tbl.update(
                            {
                                is_active_encounter: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE,
                                status: emr_constants.IS_IN_ACTIVE
                            },
                            { where: { uuid: encounterData[0].uuid } }),
                        encounter_doctors_tbl.update(
                            {
                                encounter_doctor_status: emr_constants.IS_IN_ACTIVE, is_active: emr_constants.IS_IN_ACTIVE,
                                status: emr_constants.IS_IN_ACTIVE
                            },
                            { where: { encounter_uuid: encounterData[0].uuid } })
                        ];
                    }
                } else if (encounter_type_uuid === 1 && encounterData && encounterData.length > 0) {
                    return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: emr_constants.DUPLICATE_ENCOUNTER });
                }


                encounterPromise = [...encounterPromise,
                encounter_tbl.create(encounter, { returning: true })
                ];

                const createdEncounterData = await Promise.all(encounterPromise);

                if (createdEncounterData) {
                    encounter.uuid = encounterDoctor.encounter_uuid = getCreatedEncounterId(createdEncounterData);

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
    };

    return {

        getEncounterByDocAndPatientId: _getEncounterByDocAndPatientId,
        createPatientEncounter: _createPatientEncounter

    };
};

module.exports = Encounter();

function getCreatedEncounterId(createdEncounterData) {

    return createdEncounterData.length > 1 ? createdEncounterData[2].uuid : createdEncounterData[0].uuid;
}


function getEncounterQuery(pId, from_date, to_date) {
    return {
        where: {
            patient_uuid: pId,
            encounter_date: {
                [Op.between]: [from_date, to_date]
            },
            is_active_encounter: emr_constants.IS_ACTIVE,
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE
        },
        include: [
            {
                model: encounter_type_tbl,
                attributes: ['uuid', 'code', 'name'],
                where: {
                    is_active: emr_constants.IS_ACTIVE,
                    status: emr_constants.IS_ACTIVE
                }
            },
        ]
    };
}