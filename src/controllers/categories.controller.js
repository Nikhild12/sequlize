// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');
const { validate } = require('../config/validate');
const config = require('../config/config');

const emr_utility = require('../services/utility.service');
const appMasterData = require("../controllers/appMasterData");

const { APPMASTER_UPDATE_SCREEN_SETTINGS } = emr_constants.DEPENDENCY_URLS;

const categoriesTbl = sequelizeDb.categories;
const categoryTypeMasterTbl = sequelizeDb.category_type_master;
const profile_section_categories_tbl = sequelizeDb.profile_section_categories;

const categoriesController = () => {



    /**
    * Adding categories
    * @param {*} req 
    * @param {*} res 
    */
    const _addCategories = async (req, res) => {
        try {

            const { user_uuid } = req.headers;
            const Authorization = req.headers.authorization ? req.headers.authorization : req.headers.Authorization;
            let categories = req.body;
            const body_validation_result = validate(categories, ['code', 'name']);
            if (!body_validation_result.status) {
                throw new Error(body_validation_result.errors);
            }

            let categoriesOutput = await categoriesTbl.findAll({
                where: {
                    [Op.or]: [{ code: categories.code }, { name: categories.name }],
                    status: 1
                }
            });
            let duplicate_code = [], duplicate_name = [], duplicate = [];
            for (let e of categoriesOutput) {
                if (e.code == categories.code && e.name != categories.name) {
                    duplicate_code.push(e.uuid);
                }
                if (e.name == categories.name && e.code != categories.code) {
                    duplicate_name.push(e.uuid)
                }
                if (e.name == categories.name && e.code == categories.code) {
                    duplicate.push(e.uuid);
                }
            }
            if (duplicate.length > 0) {
                return res
                    .json({
                        statusCode: 1062,
                        msg: "name and code are already exits"
                    });
            }
            if (duplicate_name.length > 0) {
                return res
                    .json({
                        statusCode: 1062,
                        msg: "name already exits"
                    });
            }
            if (duplicate_code.length > 0) {
                return res
                    .json({
                        statusCode: 1062,
                        msg: "code already exits"
                    });
            }
            categories.created_by = user_uuid;
            const categoriesResponse = await categoriesTbl.create(categories);
            let options = {
                uri: config.wso2AppUrl + APPMASTER_UPDATE_SCREEN_SETTINGS,
                headers: {
                    Authorization: Authorization,
                    user_uuid: user_uuid
                },
                body: {
                    screenId: categories.screen_settings_uuid,
                    suffix_current_value: categories.code.replace("CAT", '')
                }
            };
            await emr_utility.putRequest(options.uri, options.headers, options.body);
            return res.status(200).send({ code: httpStatus.OK, message: 'inserted successfully', responseContents: categoriesResponse });
        }
        catch (err) {
            if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
                return res.status(400).json({ statusCode: 400, Error: err.errors, msg: "Validation error" });
            }
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    statusCode: 500,
                    status: "error",
                    msg: errorMsg
                });
        }

    };

    const _deleteCategories = async (req, res) => {
        try {
            const { user_uuid } = req.headers;
            const { uuid } = req.body;
            if (!uuid) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: "Id is missing" });
            }

            let get_section_category_data = await profile_section_categories_tbl.findOne({
                where: {
                    category_uuid: uuid,
                    status: 1
                }
            });
            if (get_section_category_data && (get_section_category_data != null || Object.keys(get_section_category_data).length > 1)) {
                throw {
                    error_type: "validation",
                    errors: "The Sub Heading is already mapped to the Notes"
                }
            }
            let get_category_data = await categoriesTbl.findOne({
                where: {
                    uuid: uuid,
                    status: 1
                }
            });
            if (get_category_data == null || Object.keys(get_category_data).length < 1) {
                throw {
                    error_type: "validation",
                    errors: "Data not exists"
                }
            }

            const data = await categoriesTbl.update(
                {
                    status: 0,
                    is_active: 0,
                    modified_date: new Date(),
                    modified_by: user_uuid,
                    name: get_category_data.name + " (deleted) " + uuid
                },
                {
                    where: {
                        uuid: uuid
                    }
                });
            if (data[0] == 0) {
                return res.status(400).send({ code: httpStatus.OK, message: 'Deleted Fail' });
            }
            return res.status(200).send({ code: httpStatus.OK, message: 'Deleted Successfully', responseContents: data });
        }
        catch (err) {
            if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
                return res.status(400).json({ statusCode: 400, Error: err.errors, msg: "Validation error" });
            }
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    statusCode: 500,
                    status: "error",
                    msg: errorMsg
                });
        }
    };

    const _getCategoriesById = async (req, res) => {
        try {
            let { uuid } = req.body;
            let Authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization;
            const { user_uuid } = req.headers;
            if (!uuid) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: "Id is missing" });
            }
            const categoriesData = await categoriesTbl.findOne({
                include: [
                    {
                        model: categoryTypeMasterTbl,
                        required: false,
                        attributes: ['uuid', 'code', 'name']
                    }
                ],
                where: { uuid: uuid }
            });
            if (categoriesData) {
                const usersResponse = await appMasterData.getDoctorDetails(user_uuid, Authorization, [categoriesData.created_by, categoriesData.modified_by]);
                for (let e of usersResponse.responseContents) {
                    if (e.uuid == categoriesData.created_by) {
                        categoriesData.dataValues.created_by_first_name = e.first_name;
                        categoriesData.dataValues.created_by_last_name = e.last_name;
                        categoriesData.dataValues.created_by_middle_name = e.middle_name;
                        categoriesData.dataValues.created_by_user_name = e.user_name;
                    }
                    if (e.uuid == categoriesData.modified_by) {
                        categoriesData.dataValues.modified_by_first_name = e.first_name;
                        categoriesData.dataValues.modified_by_last_name = e.last_name;
                        categoriesData.dataValues.modified_by_middle_name = e.middle_name;
                        categoriesData.dataValues.modified_by_user_name = e.user_name;
                    }
                }
            }
            return res.status(200).send({ code: httpStatus.OK, responseContent: categoriesData });
        }
        catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };

    const _updateCategories = async (req, res) => {
        try {
            let { uuid } = req.body;
            if (!uuid) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: "Id is missing" });
            }
            let postdata = req.body;
            let categoriesOutput = await categoriesTbl.findAll({
                where: {
                    name: postdata.name,
                    status: 1,
                    uuid: {
                        [Op.notIn]: [uuid]
                    }
                }
            });
            if (categoriesOutput.length > 0) {
                return res
                    .json({
                        statusCode: 1062,
                        msg: "name already exits"
                    });
            }
            delete postdata.uuid;
            let selector = {
                where: { uuid: uuid, status: 1 }
            };
            const data = await categoriesTbl.update(postdata, selector, { returning: true });
            if (data) {
                return res.status(200).send({ code: httpStatus.OK, message: 'Updated Successfully', responseContents: data });
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "Not Updated" });
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
    const _getAllCategoriesPost = async (req, res) => {
        try {
            const postData = req.body;
            let pageNo = 0;
            const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
            let sortArr = ['modified_date', 'DESC'];
            if (postData.pageNo) {
                let temp = parseInt(postData.pageNo);
                if (temp && (temp != NaN)) {
                    pageNo = temp;
                }
            }
            const offset = pageNo * itemsPerPage;
            let fieldSplitArr = [];
            if (postData.sortField) {
                fieldSplitArr = postData.sortField.split('.');
                if (fieldSplitArr.length == 1) {
                    sortArr[0] = postData.sortField;
                } else {
                    for (let idx = 0; idx < fieldSplitArr.length; idx++) {
                        const element = fieldSplitArr[idx];
                        fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
                    }
                    sortArr = fieldSplitArr;
                }
            }
            if (postData.sortOrder && ((postData.sortOrder.toLowerCase() == 'asc') || (postData.sortOrder.toLowerCase() == 'desc'))) {
                if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
                    sortArr[1] = postData.sortOrder;
                } else {
                    sortArr.push(postData.sortOrder);
                }
            }
            let findQuery = {
                offset: offset,
                limit: itemsPerPage,
                order: [
                    sortArr
                ],
                include: [
                    {
                        model: categoryTypeMasterTbl,
                        required: false,
                        attributes: ['uuid', 'code', 'name']
                    }
                ],
                where: { status: 1 }
            };
            if (postData.search && /\S/.test(postData.search)) {
                findQuery.where = Object.assign(findQuery.where, {
                    [Op.or]: [
                        {
                            name: {
                                [Op.like]: "%" + postData.search + "%"
                            }
                        },
                        {
                            code: {
                                [Op.like]: "%" + postData.search + "%"
                            }
                        },
                        {
                            description: {
                                [Op.like]: "%" + postData.search + "%"
                            }
                        },
                        {
                            "$category_type_master.name$": {
                                [Op.like]: "%" + postData.search + "%"

                            }
                        }
                    ]
                });
            }

            if (postData.codeOrName && /\S/.test(postData.codeOrName)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where = Object.assign(findQuery.where, {
                        [Op.and]: [{
                            [Op.or]: [
                                {
                                    name: {
                                        [Op.like]: "%" + postData.codeOrName + "%"
                                    }
                                },
                                {
                                    code: {
                                        [Op.like]: "%" + postData.codeOrName + "%"
                                    }
                                }
                            ]
                        }]
                    });
                }
                else {
                    findQuery.where = Object.assign(findQuery.where, {
                        [Op.or]: [
                            {
                                name: {
                                    [Op.like]: "%" + postData.codeOrName + "%"
                                }
                            },
                            {
                                code: {
                                    [Op.like]: "%" + postData.codeOrName + "%"
                                }
                            }
                        ]
                    });
                }
            }

            let status;
            if (postData.status == 0 || postData.status == "0") {
                status = 0;
            }
            else {
                status = 1;
            }
            findQuery.where = Object.assign(findQuery.where, {
                is_active: status
            });
            const categoriesData = await categoriesTbl.findAndCountAll(findQuery);
            return res.status(200).send({ code: httpStatus.OK, message: 'Fetched categories Details successfully', responseContents: categoriesData.rows, totalRecords: categoriesData.count });
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
        getAllCategories: _getAllCategories,
        getAllCategoriesPost: _getAllCategoriesPost
    };
};

module.exports = categoriesController();