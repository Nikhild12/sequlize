
//Package Import
const httpStatus = require("http-status");
//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

// Patient notes
const patNotesAtt = require('../attributes/patient_previous_notes_attributes');

const sectionCategoryEntriesTbl = db.section_category_entries;
const profilesTbl = db.profiles;

const notesController = () => {

    /**
           * OPNotes main template save
           * @param {*} req 
           * @param {*} res 
           */
    const _addProfiles = async (req, res) => {

        const { user_uuid } = req.headers;
        let profiles = req.body;

        if (user_uuid) {

            profiles.is_active = profiles.status = true;
            profiles.created_by = profiles.modified_by = user_uuid;
            profiles.created_date = profiles.modified_date = new Date();
            profiles.revision = 1;

            try {
                const profileData = await sectionCategoryEntriesTbl.bulkCreate(profiles, { returing: true });
                return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', reqContents: req.body });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };

    const _getPreviousPatientOPNotes = async (req, res) => {
        const { user_uuid } = req.headers;
        const { patient_uuid } = req.query;

        let filterQuery = {
            patient_uuid: patient_uuid,
            status: emr_constants.IS_ACTIVE,
            is_active: emr_constants.IS_ACTIVE
        };
        if (user_uuid && patient_uuid > 0) {
            try {
                const getOPNotesByPId = await getPrevNotes(filterQuery, Sequelize);
                // Code and Message for Response
                const code = emr_utility.getResponseCodeForSuccessRequest(getOPNotesByPId);
                const message = emr_utility.getResponseMessageForSuccessRequest(code, 'ppnd');
                // const notesResponse = patNotesAtt.getPreviousPatientOPNotes(getOPNotesByPId);
                return res.status(200).send({ code: code, message, responseContents: getOPNotesByPId });


            } catch (ex) {
                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({ code: httpStatus[400], message: ex.message });

            }
        } else {
            return res.status(400).send({
                code: httpStatus[400], message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
            });
        }
    };

    const _getOPNotesDetailsById = async (req, res) => {

        const { uuid } = req.query;
        const { user_uuid } = req.headers;

        try {
            if (user_uuid && uuid) {
                const notesData = await sectionCategoryEntriesTbl.findOne({ where: { uuid: uuid } }, { returning: true });
                if (!notesData) {
                    return res.status(404).send({ code: 404, message: emr_constants.NO_RECORD_FOUND });
                }
                return res.status(200).send({ code: httpStatus.OK, responseContent: notesData });
            } else {
                return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
            }
        }
        catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };


    const _getOPNotesDetailsByPatId = async (req, res) => {

        const { patient_uuid } = req.query;
        const { user_uuid } = req.headers;

        try {
            if (user_uuid && patient_uuid) {
                const patNotesData = await sectionCategoryEntriesTbl.findAll({ where: { patient_uuid: patient_uuid } }, { returning: true });
                if (!patNotesData) {
                    return res.status(404).send({ code: 404, message: emr_constants.NO_RECORD_FOUND });
                }
                return res.status(200).send({ code: httpStatus.OK, responseContent: patNotesData });
            } else {
                return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
            }
        }
        catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };

    return {
        addProfiles: _addProfiles,
        getPreviousPatientOPNotes: _getPreviousPatientOPNotes,
        getOPNotesDetailsById: _getOPNotesDetailsById,
        getOPNotesDetailsByPatId: _getOPNotesDetailsByPatId
    }
}

module.exports = notesController();


async function getPrevNotes(filterQuery, Sequelize) {
    //console.log(filterQuery);
    return sectionCategoryEntriesTbl.findAll({
        where: filterQuery,
        group: ['profile_uuid'],
        attributes: ['uuid', 'patient_uuid', 'encounter_uuid', 'encounter_type_uuid', 'encounter_doctor_uuid', 'consultation_uuid', 'profile_uuid', 'is_active', 'status', 'created_date', 'modified_by', 'created_by', 'modified_date',
            [Sequelize.fn('COUNT', Sequelize.col('profile_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('profile_uuid')), 'DESC']],
        limit: 10,
        include: [{
            model: profilesTbl,
            attributes: ['uuid', 'profile_code', 'profile_name', 'profile_description', 'facility_uuid', 'department_uuid', 'created_date']
        }],
    });

}
