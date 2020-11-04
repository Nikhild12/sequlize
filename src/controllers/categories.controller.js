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
const categoryTypeMasterTbl = sequelizeDb.category_type_master;

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
        try {
            let { uuid } = req.body;
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