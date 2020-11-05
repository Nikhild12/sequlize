// Package Import
const httpStatus = require('http-status');

// Sequelizer Import
const Sequelize = require('sequelize');
const sequelizeDb = require('../config/sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const emr_utility = require('../services/utility.service');
const appMasterData = require("../controllers/appMasterData");


const sectionsTbl = sequelizeDb.sections;
const sectionNoteTypesTbl = sequelizeDb.section_note_types;
const sectionTypesTbl = sequelizeDb.section_types;

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
        try {
            const { user_uuid } = req.headers;
            const { uuid } = req.body;
            if (!uuid) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: "Id is missing" });
            }
            const data = await sectionsTbl.update(
                {
                    status: 0,
                    is_active: 0,
                    modified_date: new Date(),
                    modified_by: user_uuid
                },
                {
                    where: {
                        uuid: uuid
                    }
                });
            if (data) {
                return res.status(200).send({ code: httpStatus.OK, message: 'Deleted Successfully' });
            } else {
                return res.status(400).send({ code: httpStatus.OK, message: 'Deleted Fail' });
            }
        }
        catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };

    const _getSectionsById = async (req, res) => {
        try {
            let Authorization = req.headers.Authorization ? req.headers.Authorization : req.headers.authorization;
            const { user_uuid } = req.headers;
            const { uuid } = req.body;
            if (!uuid) {
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: "Id is missing" });
            }
            let findQuery = {
                where: { uuid: uuid },
                include: [
                    {
                        model: sectionNoteTypesTbl,
                        required: false,
                        attributes: ['uuid', 'code', 'name']
                    },
                    {
                        model: sectionTypesTbl,
                        required: false,
                        attributes: ['uuid', 'code', 'name']
                    }
                ]
            }
            const sectionsData = await sectionsTbl.findOne(findQuery);

            if (sectionsData) {
                const usersResponse = await appMasterData.getDoctorDetails(user_uuid, Authorization, [sectionsData.created_by, sectionsData.modified_by]);
                for (let e of usersResponse.responseContents) {
                    if (e.uuid == sectionsData.created_by) {
                        sectionsData.dataValues.created_by_first_name = e.first_name;
                        sectionsData.dataValues.created_by_last_name = e.last_name;
                        sectionsData.dataValues.created_by_middle_name = e.middle_name;
                        sectionsData.dataValues.created_by_user_name = e.user_name;
                    }
                    if (e.uuid == sectionsData.modified_by) {
                        sectionsData.dataValues.modified_by_first_name = e.first_name;
                        sectionsData.dataValues.modified_by_last_name = e.last_name;
                        sectionsData.dataValues.modified_by_middle_name = e.middle_name;
                        sectionsData.dataValues.modified_by_user_name = e.user_name;
                    }
                }
            }
            return res.status(200).send({ code: httpStatus.OK, responseContent: sectionsData });
        }
        catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };

    const _updateSections = async (req, res) => {
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
            const data = await sectionsTbl.update(postdata, selector, { returning: true });
            if (data) {
                return res.status(200).send({ code: httpStatus.OK, message: 'Updated Successfully', responseContents: data });
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "Not updated" });
            }
        }
        catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };

    // Get All scetions List
    const _getAllSections = async (req, res) => {

        const { user_uuid } = req.headers;
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
    const _getAllSectionsPost = async (req, res) => {
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
                        model: sectionNoteTypesTbl,
                        required: false,
                        attributes: ['uuid', 'code', 'name']
                    },
                    {
                        model: sectionTypesTbl,
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
                            "$section_note_type.name$": {
                                [Op.like]: "%" + postData.search + "%"

                            }
                        },
                        {
                            "$section_type.name$": {
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

            const sectionsData = await sectionsTbl.findAndCountAll(findQuery);
            return res.status(200).send({ code: httpStatus.OK, message: 'Fetched sections Details successfully', responseContents: sectionsData.rows, totalRecords: sectionsData.count })
        } catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };
    //master purpose
    const _getAllSectionsListMaster = async (req, res) => {

        const { user_uuid } = req.headers;
        const { uuid } = req.body;
        try {

            if (user_uuid) {
                const sectionsData = await sectionsTbl.findAll({
                    where: { status: 1, is_active: 1 }
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
        getAllSections: _getAllSections,
        getAllSectionsPost: _getAllSectionsPost,
        getSections: _getAllSectionsListMaster

    };
};

module.exports = sectionsController();