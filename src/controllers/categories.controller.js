// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');

const categoriesTbl = sequelizeDb.categories;

const categoriesController = () => {



    /**
    * Adding categories
    * @param {*} req 
    * @param {*} res 
    */
    const _addCategories = async (req, res) => {

        const { user_uuid } = req.headers;
        let categories = req.body;
        if (user_uuid) {

            categories.is_active = categories.status = true;
            categories.created_by = categories.modified_by = user_uuid;
            categories.created_date = categories.modified_date = new Date();
            categories.revision = 1;

            try {
                await categoriesTbl.create(categories, { returing: true });
                return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: categories });

            }
            catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
        }

    };

    const _deleteCategories = async (req, res) => {
        const { user_uuid } = req.headers;
        const { uuid } = req.body;
        if (user_uuid && uuid) {
            const updatedCategoriesData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };
            try {
                const data = await categoriesTbl.update(updatedCategoriesData, { where: { uuid: uuid } }, { returning: true });
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

    const _getCategoriesById = async (req, res) => {

        const { uuid } = req.body;
        const { user_uuid } = req.headers;

        try {

            if (user_uuid && uuid) {
                const categoriesData = await categoriesTbl.findOne({ where: { uuid: uuid, created_by: user_uuid } }, { returning: true });
                return res.status(200).send({ code: httpStatus.OK, responseContent: categoriesData });
            } else {
                return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: emr_constants.NO_USER_ID });
            }
        }
        catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };

    const _updateCategories = async (req, res) => {
        try {
            const { user_uuid } = req.headers;
            let { uuid } = req.body;
            let postdata = req.body;
            let selector = {
                where: { uuid: uuid, status: 1, is_active: 1 }
            };
            if (user_uuid && uuid) {
                const data = await categoriesTbl.update(postdata, selector, { returning: true });
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

    // Get All categories List
    const _getAllCategories = async (req, res) => {

        const { user_uuid } = req.headers;
        const { uuid } = req.body;
        try {

            if (user_uuid) {
                const categoriesData = await categoriesTbl.findAll({
                    // attributes: ['pis_uuid', 'pis_immunization_date', 'et_name', 'i_name', 'f_name', 'pis_comments'],
                    //where: { pis_patient_uuid: patient_uuid, pis_is_active: 1, pis_status: 1, et_is_active: 1, et_status: 1, i_is_active: 1, i_status: 1, f_is_active: 1, f_status: 1 }
                    where: { status: 1, is_active: 1 },

                });
                return res.status(200).send({ code: httpStatus.OK, message: 'Fetched categories Details successfully', responseContents: categoriesData });
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
        addCategories: _addCategories,
        deleteCategories: _deleteCategories,
        updateCategories: _updateCategories,
        getCategoriesById: _getCategoriesById,
        getAllCategories: _getAllCategories


    };
};

module.exports = categoriesController();