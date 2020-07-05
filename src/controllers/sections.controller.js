// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

const sectionsTbl = sequelizeDb.sections;

const sectionsController = () => {



    /**
    * Adding sections
    * @param {*} req 
    * @param {*} res 
    */
    const _addSections = async (req, res) => {

        const { user_uuid } = req.headers;
        let sections = req.body;
        if (user_uuid) {

            sections.is_active = sections.status = true;
            sections.created_by = sections.modified_by = user_uuid;
            sections.created_date = sections.modified_date = new Date();
            sections.revision = 1;

            try {
                await sectionsTbl.create(sections, { returing: true });
                return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: sections });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };

    const _deleteSections = async (req, res) => {
        const { user_uuid } = req.headers;
        const { uuid } = req.body;
        if (user_uuid && uuid) {
            const updatedSectionsData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
            try {
                const data = await sectionsTbl.update(updatedSectionsData, { where: { uuid: uuid } }, { returning: true });
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

    const _getSectionsById = async (req, res) => {

        const { uuid } = req.body;
        const { user_uuid } = req.headers;

        try {

            if (user_uuid && uuid) {
                const sectionsData = await sectionsTbl.findOne({ where: { uuid: uuid, created_by: user_uuid } }, { returning: true });
                return res.status(200).send({ code: httpStatus.OK, responseContent: sectionsData });
            } else {
                return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
            }
        }
        catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };

    const _updateSections = async (req, res) => {
        try {
            const { user_uuid } = req.headers;
            let { uuid } = req.body;
            let postdata = req.body;
            let selector = {
                where: { uuid: uuid, status: 1, is_active: 1 }
            };
            if (user_uuid && uuid) {
                const data = await sectionsTbl.update(postdata, selector, { returning: true });
                console.log('data==', data);
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

    // Get All scetions List
    const _getAllSections = async (req, res) => {

        const { user_uuid } = req.headers;
        const { uuid } = req.body;
        try {

            if (user_uuid) {
                const sectionsData = await sectionsTbl.findAll({
                    // attributes: ['pis_uuid', 'pis_immunization_date', 'et_name', 'i_name', 'f_name', 'pis_comments'],
                    //where: { pis_patient_uuid: patient_uuid, pis_is_active: 1, pis_status: 1, et_is_active: 1, et_status: 1, i_is_active: 1, i_status: 1, f_is_active: 1, f_status: 1 }
                    where: { status: 1, is_active: 1 },
                });
                return res.status(200).send({ code: httpStatus.OK, message: 'Fetched sections Details successfully', responseContents: sectionsData });
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
        addSections: _addSections,
        deleteSections: _deleteSections,
        updateSections: _updateSections,
        getSectionsById: _getSectionsById,
        getAllSections: _getAllSections


    };
};

module.exports = sectionsController();