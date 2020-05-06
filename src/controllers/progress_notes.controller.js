// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// EMR Constants Import
const emr_constants = require('../config/constants');

// EMR Utility Service
const emr_utility = require('../services/utility.service');

// Initialize Tick Sheet Master
const progressNotesTbl = sequelizeDb.progress_notes;
const vwProgressNotesTbl = sequelizeDb.vw_progress_notes;
const progress_notes = () => {


    /**
     * Create progress notes API
     * @param {*} req 
     * @param {*} res 
     */

    const _createProgressNotes = async (req, res) => {

        const { user_uuid } = req.headers;
        let progressData = req.body;

        if (user_uuid) {

            progressData.is_active = progressData.status = true;
            progressData.created_by = progressData.modified_by = user_uuid;
            progressData.created_date = progressData.modified_date = new Date();
            progressData.revision = 1;

            try {
                await progressNotesTbl.create(progressData, { returing: true });
                return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: progressData });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };
    /**
     * Get progressNotes Details API By User Id
     * @param {*} req 
     * @param {*} res 
     */
    const _getProgressNotesDetailsById = async (req, res) => {

        const { progressNotes_uuid } = req.query;
        const { user_uuid } = req.headers;

        try {
            if (user_uuid && progressNotes_uuid) {
                const notesData = await vwProgressNotesTbl.findOne({ where: { p_uuid: progressNotes_uuid, p_created_by: user_uuid } }, { returning: true });
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

    /**
     * Delete progressNotes details 
     * @param {*} req 
     * @param {*} res 
     */

    const _deleteProgressNotes = async (req, res) => {
        const { user_uuid } = req.headers;
        const { progressNotes_uuid } = req.query;
        if (user_uuid && progressNotes_uuid) {
            const updatedProgressData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
            try {
                const data = await progressNotesTbl.update(updatedProgressData, { where: { uuid: progressNotes_uuid } }, { returning: true });
                if (data) {
                    return res.status(200).send({ code: httpStatus.OK, message: 'Deleted Successfully' });
                } else {
                    return res.status(400).send({ code: httpStatus.OK, message: 'Deleted Fail' });

                }

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

            }

        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });

        }
    };

    /**
     * Update PorgressNotes Details for the userid
     * @param {*} req 
     * @param {*} res 
     */

    const _updateProgressNotes = async (req, res) => {
        try {
            const { user_uuid } = req.headers;
            let { progressNotes_uuid } = req.query;
            let postdata = req.body;
            let selector = {
                where: { uuid: progressNotes_uuid, status: 1, is_active: 1 }
            };
            if (user_uuid && progressNotes_uuid) {
                const data = await progressNotesTbl.update(postdata, selector, { returning: true });
                if (data) {
                    return res.status(200).send({ code: httpStatus.OK, message: 'Updated Successfully', responseContents: data });
                }
                else {
                    return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
                }
            }

        }
        catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });

        }
    };

    const _getAllProgressNotesDetails = async (req, res) => {

        const { user_uuid } = req.headers;

        try {
            if (user_uuid) {
                const notesData = await vwProgressNotesTbl.findAll();
                return res.status(200).send({ code: httpStatus.OK, message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY, responseContents: notesData });
            }
            else {
                return res.status(422).send({ code: httpStatus[400], message: emr_constants.FETCHD_PROFILES_FAIL });
            }
        } catch (ex) {

            console.log(ex.message);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };
    return {

        createProgressNotes: _createProgressNotes,
        getProgressNotesDetailsById: _getProgressNotesDetailsById,
        deleteProgressNotes: _deleteProgressNotes,
        updateProgressNotes: _updateProgressNotes,
        getAllProgressNotesDetails: _getAllProgressNotesDetails

    };
};

module.exports = progress_notes();



