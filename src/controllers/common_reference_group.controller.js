const _ = require("lodash");
const httpStatus = require("http-status");
const db = require("../config/sequelize");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
const checkDuplicate = require("../helpers/checkDuplicate.js");
const rp = require('request-promise');
const config = require('../config/config');
const emr_constants = require("../config/constants");
const { APPMASTER_GET_SCREEN_SETTINGS } = emr_constants.DEPENDENCY_URLS;


const commonReferenceGroupController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

    /*=============== common reference API's================*/
    const getReference = async (req, res, next) => {
        try {
            const { search, status = 1, name, table_name, pageNo = 0, paginationSize = 10, sortField = 'display_order', sortOrder = 'ASC' } = req.body;
            const common_tbl = db[table_name];
            let postingData = {
                offset: pageNo * paginationSize,
                limit: +(paginationSize),
                order: [
                    [sortField, sortOrder],
                ],
                where: {}
            };

            if (name && /\S/.test(name)) {
                postingData.where = Object.assign(postingData.where, {
                    [Op.and]: [{
                        [Op.or]: [{
                            code: {
                                [Op.like]: '%' + name.toLowerCase() + '%',
                            }
                        }, {
                            name: {
                                [Op.like]: '%' + name.toLowerCase() + '%',
                            }
                        }]
                    }]
                });
            }
            if (search && /\S/.test(search)) {
                postingData.where = Object.assign(postingData.where, {
                    [Op.and]: [{
                        [Op.or]: [{
                            code: {
                                [Op.like]: '%' + search.toLowerCase() + '%',
                            }
                        }, {
                            name: {
                                [Op.like]: '%' + search.toLowerCase() + '%',
                            }
                        }
                        ]
                    }]
                });
            }
            postingData.where.is_active = status;
            let data = await common_tbl.findAndCountAll(postingData);
            const code = data.rows.length === 0 ? 204 : 200;
            const message = data.rows.length === 0 ? emr_constants.NO_RECORD_FOUND : emr_constants.DRUG_FREQUENCY;
            return res
                .status(httpStatus.OK)
                .json({
                    message, code, responseContents: data.rows, totalRecords: data.count,
                });

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    statusCode: 500,
                    msg: errorMsg
                });
        }
    };

    async function getlanguageDetails(user_uuid, data, authorization) {
        let options = {
            uri: config.wso2AppUrl + 'commonReference/getReferenceById',
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: authorization,
                user_uuid: user_uuid
            },
            body: {
                "table_name": "language",
                "Id": data.language_uuid
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        return user_details.responseContents[0];
    }

    const getReferenceByIdForLanguage = async (req, res, next) => {
        const postData = req.body;
        // const table_name = "gender";
        // const table_name = "department";
        const table_name = postData.table_name;
        const common_tbl = db[table_name];

        try {
            /* gender Data */
            let data = await common_tbl.findOne({
                where: {
                    uuid: postData.Id
                }

            });

            if (data != null) {
                const getlanguageDetailsdata = await getlanguageDetails(req.headers.user_uuid, data.dataValues, req.headers.authorization);
                data.dataValues.language_details = getlanguageDetailsdata;
                return res
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        req: '',
                        responseContent: data,
                        totalRecords: data.length
                    });
            } else {
                return res
                    .status(httpStatus.OK)
                    .json({
                        statusCode: httpStatus.OK,
                        msg: "Reference Data's not found",
                        req: ''
                    });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    msg: errorMsg
                });
        }
    };

    const getReferenceById = async (req, res, next) => {
        const postData = req.body;
        // const table_name = "gender";
        // const table_name = "department";
        const table_name = postData.table_name;
        const common_tbl = db[table_name];

        try {
            /* gender Data */
            await common_tbl.findOne({
                where: {
                    uuid: postData.Id
                }

            })
                .then((data) => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            statusCode: 200,
                            req: '',
                            responseContent: data,
                            totalRecords: data.length
                        });
                })
                .catch(err => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            statusCode: 500,
                            msg: "Reference Data's not found",
                            req: '',
                            error: err
                        });
                });
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    statusCode: 500,
                    msg: errorMsg
                });
        }
    };

    const addReference = async (req, res, next) => {
        const postData = req.body;
        const table_name = postData.table_name;
        // const table_name = "gender";
        const common_tbl = db[table_name];
        postData.created_by = req.body.user_uuid;
        postData.modified_by = req.body.user_uuid;
        postData.modified_date = new Date();
        postData.created_date = new Date();
        postData.status = postData.is_active;

        try {
            if (postData && common_tbl && db[table_name]) {
                duplicateResult = await checkDuplicate.checkRefGroupExistsCreate(req.body, common_tbl, table_name);

                // common_tbl.findAll({
                //     where: {
                //         [Op.or]: [{
                //                 code: postData.code
                //             },
                //             {
                //                 name: postData.name
                //             }
                //         ]
                //     }
                // }).then(async (result) => {
                //     if (result.length != 0) {
                //         return res.send({
                //             statusCode: 400,
                //             status: "error",
                //             msg: "Please enter new common reference group"
                //         });
                //     } 
                if (duplicateResult.count == 0) {
                    await common_tbl.create(postData, {
                        returning: true
                    }).then(data => {

                        res.send({
                            statusCode: 200,
                            msg: "Inserted common reference group details Successfully",
                            req: postData,
                            responseContents: data
                        });
                    }).catch(err => {

                        res.send({
                            status: "failed",
                            msg: "failed to common reference group details",
                            error: err
                        });
                    });
                }
                else {
                    return res.status(422).send({
                        statusCode: 422,
                        status: "failed",
                        errorCode: duplicateResult.errorCode,
                        msg: duplicateResult.msg
                    });
                }
                // });

                // await common_tbl.create(dynamicField(postData, table_name, 1), {
                //     returning: true,
                //     plain: true
                // }).then(data => {
                //     res.send({
                //         statusCode: 200,
                //         msg: "Inserted Reference Successfully",
                //         req: postData,
                //         responseContents: data,
                //         totalRecords: data.length
                //     });
                // }).catch(err => {
                //     if ((err && err['original'] && err['original']['errno'] == 1062)) {
                //         return res
                //             .status(409)
                //             .json({
                //                 statusCode: 409,
                //                 error: err
                //             });
                //     }
                //     else {
                //         return res
                //             .status(500)
                //             .json({
                //                 statusCode: 500,
                //                 error: err
                //             });
                //     }
                // });
            } else {
                res.send({
                    status: 'failed',
                    msg: 'Please enter Reference details'

                });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: errorMsg
                });
        }
    };

    const updateReference = async (req, res, next) => {
        const postData = req.body;
        // const table_name = "department";
        const table_name = postData.table_name;
        const common_tbl = db[table_name];

        postData.status = postData.is_active;
        postData.modified_by = req.body.user_uuid;
        postData.modified_date = new Date();

        try {

            duplicateResult = await checkDuplicate.checkRefGroupExistsUpdate(req.body, common_tbl, table_name);
            if (duplicateResult.count == 0) {
                await common_tbl.update(dynamicField(postData, table_name, 0), {
                    // name: postData.name,
                    where: {
                        uuid: postData.Id,
                        status: 1
                    }
                }).then((data) => {
                    res.send({
                        statusCode: 200,
                        msg: "Updated Successfully",
                        req: postData,
                        responseContent: data,
                        totalRecords: data.length
                    });
                }).catch(err => {
                    res.send({
                        status: "failed",
                        msg: "failed to update data",
                        error: err
                    });
                });
            } else {
                return res.status(422).send({
                    statusCode: 422,
                    status: "failed",
                    errorCode: duplicateResult.errorCode,
                    msg: duplicateResult.msg
                });
            }

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: errorMsg
                });
        }
    };

    const deleteReference = async (req, res, next) => {
        const postData = req.body;
        const table_name = postData.table_name;

        const common_tbl = db[table_name];
        postData.modified_by = req.headers.user_uuid;
        try {

            if (postData.Id) {

                await common_tbl.update({
                    is_active: 0,
                    status: 0,
                    modified_by: req.headers.user_uuid
                }, {
                    where: {
                        uuid: postData.Id
                    }
                }).then((data) => {

                    res.send({
                        statusCode: 200,
                        msg: "Deleted Successfully",
                        req: postData,
                        responseContents: data,
                        totalRecords: data.length
                    });
                }).catch(err => {

                    res.send({
                        status: "failed",
                        msg: "failed to delete data",
                        error: err
                    });
                });
            } else if (postData.id) {
                await common_tbl.update({
                    is_active: postData.is_active,
                    modified_by: postData.modified_by
                }, {
                    where: {
                        uuid: postData.Id
                    }
                }).then((data) => {

                    res.send({
                        statusCode: 200,
                        msg: "Deleted Successfully",
                        req: postData,
                        responseContents: data,
                        totalRecords: data.length
                    });
                }).catch(err => {

                    res.send({
                        status: "failed",
                        msg: "failed to delete data",
                        error: err
                    });
                });
            } else {
                res.send({
                    status: 'failed',
                    msg: 'Please enter reference details'
                });
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: errorMsg
                });
        }
    };

    function dynamicField(postData, tableName, keyValue) {
        let postingData;
        // if(true)
        // {
        //    postingData = {
        //     name: postData.name,
        //     code: postData.code,
        //     display_order:postData.display_order,
        //         language: postData.language,
        //         color:postData.color,
        //         Is_default:postData.Is_default,
        //     //   revision: postData.revision,
        //     is_active: postData.is_active,
        //       created_date: postData.created_date,
        //     created_by: postData.created_by,
        //       modified_date: postData.modified_date,
        //     modified_by: postData.modified_by,
        //     // uuid: uuidv4()
        //    }
        // }

        if (false) {
            postingData = {
                name: postData.name,
                code: postData.code,
                display_order: postData.display_order,
                language: postData.language,
                color: postData.color,
                Is_default: postData.Is_default,
                is_active: postData.is_active,
                modified_by: postData.modified_by,
                icon: postData.icon,
            };
        } else {
            postingData = {
                name: postData.name,
                code: postData.code,
                is_active: postData.is_active,
                modified_by: postData.modified_by,
                language: postData.language,
                color: postData.color,
                display_order: postData.display_order,
                Is_default: postData.Is_default
            };
        }
        if (keyValue == 1) {
            postingData['created_by'] = postData.created_by;
        }
        return postingData;
    }

    const getReferenceBasedOnCondition = async (req, res, next) => {
        const postData = req.body;
        const table_name = req.body.table_name;
        const common_tbl = db[table_name];
        let sortField = 'name';
        let sortOrder = 'ASC';
        if (postData.sortField) {
            sortField = postData.sortField;
        }
        if (postData.sortOrder && ((postData.sortOrder == 'DESC') || (postData.sortOrder == 'ASC'))) {
            sortOrder = postData.sortOrder;
        }
        var postingData;
        var query1;
        try {
            postingData = {
                order: [
                    [sortField, sortOrder]
                ]
            };
            if (postData.paginationSize) {
                let itemsPerPage = parseInt(postData.paginationSize);
                let pageNo = parseInt(postData.pageNo);
                let offset = pageNo * itemsPerPage;
                postingData['offset'] = offset;
                postingData['limit'] = itemsPerPage;
            }
            if (postData.name) {
                if (query1 != null) {
                    query1 = {
                        [Op.and]: [{
                            query1,
                            [Op.or]: [
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), 'LIKE', '%' + postData.name.toLowerCase() + '%'),
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), 'LIKE', '%' + postData.name.toLowerCase() + '%'),
                            ]
                        }]
                    };
                } else {
                    query1 = {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), 'LIKE', '%' + postData.name.toLowerCase() + '%'),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), 'LIKE', '%' + postData.name.toLowerCase() + '%'),
                        ]
                    };
                }
            }
            if (postData.status != null && postData.status != "") {
                if (query1 != null) {
                    query1 = {
                        [Op.and]: [
                            query1,
                            Sequelize.where(Sequelize.col(table_name + '.is_active'), postData.status)
                        ]
                    };
                } else {
                    query1 = Sequelize.where(Sequelize.col(table_name + '.is_active'), postData.status);
                }
            }
            if (postData.search) {
                if (query1 != null) {
                    query1 = {
                        [Op.and]: [{
                            query1,
                            [Op.or]: [
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), 'LIKE', '%' + postData.search.toLowerCase() + '%')
                            ]
                        }]
                    };
                } else {
                    query1 = {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), 'LIKE', '%' + postData.search.toLowerCase() + '%')
                        ]
                    };
                }
            }
            if (query1 != null && query1 != "") {
                postingData['where'] = query1;
            }
            let data = await common_tbl.findAndCountAll(postingData);
            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: 200,
                    req: postData,
                    responseContents: data.rows,
                    totalRecords: data.count
                });
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    statusCode: 500,
                    msg: errorMsg
                });
        }
    };

    const _getSequenceNo = async (req, res, next) => {
        try {
            const { code } = req.body;
            const { user_uuid, authorization } = req.headers;
            let codeValue, replace_value;
            let options = {
                uri: config.wso2AppUrl + APPMASTER_GET_SCREEN_SETTINGS,
                headers: {
                    Authorization: authorization,
                    user_uuid: user_uuid
                },
                method: 'POST',
                json: true,
                body: {
                    code: code
                }
            };
            const screenSettings_output = await rp(options);
            if (screenSettings_output && screenSettings_output.responseContents == null) {
                throw {
                    error_type: "validation", errors: "No data found"
                }
            }
            replace_value = parseInt(screenSettings_output.responseContents.suffix_current_value) + emr_constants.IS_ACTIVE;
            screenSettings_output.responseContents.autoGenerationValue = screenSettings_output.responseContents.prefix + replace_value;
            return res
                .status(httpStatus.OK)
                .json({
                    status: 'success',
                    statusCode: httpStatus.OK,
                    msg: "Fetched successfully",
                    req: code,
                    responseContents: screenSettings_output
                });
        } catch (err) {
            if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
                return res.status(400).json({ statusCode: 400, Error: err.errors, msg: "Validation error" });
            }
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.OK)
                .json({
                    status: "error",
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    msg: 'Failed',
                    actualMsg: errorMsg
                });
        }
    };

    // --------------------------------------------return----------------------------------
    return {
        getReference,
        addReference,
        deleteReference,
        updateReference,
        getReferenceById,
        getReferenceByIdForLanguage,
        getReferenceBasedOnCondition,
        getSequenceNo: _getSequenceNo
    };
};


module.exports = commonReferenceGroupController();