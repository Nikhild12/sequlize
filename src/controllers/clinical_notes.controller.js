// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// EMR Constants Import
const emr_constants = require('../config/constants');

// EMR Utility Service
const emr_utility = require('../services/utility.service');

// Initialize Tick Sheet Master
const clinicalNotesTbl = sequelizeDb.clinical_notes;
const vwClinicalNotesTbl = sequelizeDb.vw_clinical_notes;
const clinical_notes = () => {


    /**
     * Create progress notes API
     * @param {*} req 
     * @param {*} res 
     */

    const _createClinicalNotes = async (req, res) => {

        const { user_uuid } = req.headers;
        let clinicalData = req.body;

        if (user_uuid) {
            clinicalData.forEach(element => {
                element = emr_utility.createIsActiveAndStatus(element, user_uuid);
            });
            try {
                const clinicalResponse = await clinicalNotesTbl.bulkCreate(clinicalData, { returing: true });
                return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'Inserted successfully', responseContents: clinicalResponse });
            }
            catch (ex) {
                return res.status(httpStatus.BAD_REQUEST).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(httpStatus.BAD_REQUEST).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };
    /**
     * Get progressNotes Details API By User Id
     * @param {*} req 
     * @param {*} res 
     */
    const _getClinicalNotesDetailsById = async (req, res) => {

        const { clinicalNotes_uuid } = req.query;
        const { user_uuid } = req.headers;

        try {
            if (user_uuid && clinicalNotes_uuid) {
                const notesData = await vwClinicalNotesTbl.findOne({ where: { c_uuid: clinicalNotes_uuid, c_created_by: user_uuid } }, { returning: true });
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

    const _deleteClinicalNotes = async (req, res) => {
        const { user_uuid } = req.headers;
        const { clinicalNotes_uuid } = req.query;
        if (user_uuid && clinicalNotes_uuid) {
            const updatedClinicalData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
            try {
                const data = await clinicalNotesTbl.update(updatedClinicalData, { where: { uuid: clinicalNotes_uuid } }, { returning: true });
                if (data) {
                    return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'Deleted Successfully' });
                } else {
                    return res.status(httpStatus.BAD_REQUEST).send({ code: httpStatus.OK, message: 'Deleted Fail' });

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

    const _updateClinicalNotes = async (req, res) => {
        try {
            const { user_uuid } = req.headers;
            let { clinicalNotes_uuid } = req.query;
            let postdata = req.body;
            let selector = {
                where: { uuid: clinicalNotes_uuid, status: 1, is_active: 1 }
            };
            if (user_uuid && clinicalNotes_uuid) {
                const data = await clinicalNotesTbl.update(postdata, selector, { returning: true });

                return res.status(httpStatus.OK).send({ code: httpStatus.OK, message: 'Updated Successfully', responseContents: data });

            } else {
                return res.status(httpStatus.BAD_REQUEST).send({ code: httpStatus.BAD_REQUEST, message: "No Request Body Found" });
            }

        }
        catch (ex) {
            return res.status(httpStatus.BAD_REQUEST).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };

    const _getAllClinicalNotesDetails = async (req, res) => {

        const { user_uuid } = req.headers;
        const { patient_uuid } = req.query;
        try {
            if (user_uuid) {
                const notesData = await vwClinicalNotesTbl.findAll(
                    {
                        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                        order: [['c_uuid', 'DESC']],
                        where: { c_patient_uuid: patient_uuid, c_is_active: 1, c_status: 1 }
                    },
                );
                return res.status(200).send({ statusCode: httpStatus.OK, message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY, responseContents: notesData });
            }
            else {
                return res.status(422).send({ code: httpStatus[400], message: emr_constants.FETCHD_PROFILES_FAIL });
            }
        } catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };

    const _getClinicalNotesByVisitId = async (req, res) => {

        const { user_uuid } = req.headers;
        const { patient_uuid } = req.query;
        const { encounter_uuid } = req.query;
        try {
            if (user_uuid) {
                const notesData = await vwClinicalNotesTbl.findAll(
                    {
                        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                        order: [['c_uuid', 'DESC']],
                        where: { c_patient_uuid: patient_uuid, c_encounter_uuid: encounter_uuid, c_is_active: 1, c_status: 1 }
                    },
                );
                return res.status(200).send({ code: httpStatus.OK, message: emr_constants.FETCHD_PROFILES_SUCCESSFULLY, responseContents: notesData });
            }
            else {
                return res.status(422).send({ code: httpStatus[400], message: emr_constants.FETCHD_PROFILES_FAIL });
            }
        } catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };
    return {

        createClinicalNotes: _createClinicalNotes,
        getClinicalNotesDetailsById: _getClinicalNotesDetailsById,
        deleteClinicalNotes: _deleteClinicalNotes,
        updateClinicalNotes: _updateClinicalNotes,
        getAllClinicalNotesDetails: _getAllClinicalNotesDetails,
        getClinicalNotesByVisitId: _getClinicalNotesByVisitId

    };
};

module.exports = clinical_notes();



