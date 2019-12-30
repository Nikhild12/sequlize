const _ = require("lodash");
const httpStatus = require("http-status");
const db = require("../config/sequelize");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;


// const gender_tbl = db.gender;


const commonReferenceGroupController = () => {
	/**
	 * Returns jwt token if valid username and password is provided
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */

    /*=============== Gender API's================*/

    const getReference = async (req, res, next) => {
        const postData = req.body;

        const table_name = req.body.table_name;


        const common_tbl = db[table_name];

        let sortField = 'name';
        let sortOrder = 'ASC';
        let pageNo = 0;
        const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
        if (postData.pageNo) {
            let temp = parseInt(postData.pageNo);
            if (temp && (temp != NaN)) {
                pageNo = temp;
            }
        }
        if (postData.sortField) {
            sortField = postData.sortField;
        }

        if (postData.sortOrder && ((postData.sortOrder == 'DESC') || (postData.sortOrder == 'ASC'))) {
            sortOrder = postData.sortOrder;
        }

        const offset = pageNo * itemsPerPage;
        var postingData;

        // var query;

        var query1;


        try {
            postingData = {
                offset: offset,
                limit: itemsPerPage,
                order: [
                    [sortField, sortOrder],
                ],
            };

            if (postData.name != null && postData.name != "") {
                if (query1 != null) {
                    query1 = {
                        [Op.and]: [{
                            query1,
                            [Op.or]: [
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), postData.name.toLowerCase()),
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), postData.name.toLowerCase())
                            ]
                        }]
                    };
                }
                else {
                    query1 = {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), postData.name.toLowerCase()),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), postData.name.toLowerCase())
                        ]
                    };
                }

                console.log("queryN",query1);
                
            }

            if (postData.status != null && postData.status != "") {
                if (query1 != null) {
                    query1 = {
                        [Op.and]: [
                            query1,
                            Sequelize.where(Sequelize.col(table_name + '.is_active'), postData.status)
                        ]
                    };
                }
                else {
                    query1 = Sequelize.where(Sequelize.col(table_name + '.is_active'), postData.status);
                }
                console.log("queryS",query1);
            }
            if (query1 == null) {
                if (postData.search != null && postData.search != "") {
                    query1 = {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), 'LIKE', '%' + postData.search.toLowerCase() + '%')
                        ]
                    };
                }
                console.log("querys",query1);
            }
            if (query1 != null && query1 != "") {
                postingData['where'] = query1;
            }
            /* gender Data */
            console.log("\n");
            console.log("DATA QUERY",postingData['where']);
            console.log("\n");
            

            await common_tbl.findAndCountAll(postingData).then((data) => {
                return res
                    .status(httpStatus.OK)
                    .json({ statusCode: 200, req: '', responseContents: data.rows, totalRecords: data.count });
            })
                .catch(err => {
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 500, msg: "Reference Data's not found", req: '', error: err });
                });
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ statusCode: 500, msg: errorMsg });
        }
    };
    const getReferenceIdName = async (req, res, next) => {
        const postData = req.body;

        const table_name = req.body.table_name;


        const common_tbl = db[table_name];

        let sortField = 'name';
        let sortOrder = 'ASC';
        let pageNo = 0;
        const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
        if (postData.pageNo) {
            let temp = parseInt(postData.pageNo);
            if (temp && (temp != NaN)) {
                pageNo = temp;
            }
        }
        if (postData.sortField) {
            sortField = postData.sortField;
        }

        if (postData.sortOrder && ((postData.sortOrder == 'DESC') || (postData.sortOrder == 'ASC'))) {
            sortOrder = postData.sortOrder;
        }

        const offset = pageNo * itemsPerPage;
        var postingData;

        // var query;

        var query1;


        try {
            postingData = {
                offset: offset,
                limit: itemsPerPage,
                order: [
                    [sortField, sortOrder],
                ],
                attributes: ['uuid', 'name']
            };

            if (postData.name != null && postData.name != "") {
                if (query1 != null) {
                    query1 = {
                        [Op.and]: [{
                            query1,
                            [Op.or]: [
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), postData.name.toLowerCase()),
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), postData.name.toLowerCase())
                            ]
                        }]
                    };
                }
                else {
                    query1 = {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), postData.name.toLowerCase()),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), postData.name.toLowerCase())
                        ]
                    };
                }

                console.log("queryN",query1);
                
            }

            if (postData.status != null && postData.status != "") {
                if (query1 != null) {
                    query1 = {
                        [Op.and]: [
                            query1,
                            Sequelize.where(Sequelize.col(table_name + '.is_active'), postData.status)
                        ]
                    };
                }
                else {
                    query1 = Sequelize.where(Sequelize.col(table_name + '.is_active'), postData.status);
                }
                console.log("queryS",query1);
            }
            if (query1 == null) {
                if (postData.search != null && postData.search != "") {
                    query1 = {
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), 'LIKE', '%' + postData.search.toLowerCase() + '%')
                        ]
                    };
                }
                console.log("querys",query1);
            }
            if (query1 != null && query1 != "") {
                postingData['where'] = query1;
            }
            /* gender Data */
            console.log("\n");
            console.log("DATA QUERY",postingData['where']);
            console.log("\n");
            

            await common_tbl.findAndCountAll(postingData).then((data) => {
                return res
                    .status(httpStatus.OK)
                    .json({ statusCode: 200, req: '', responseContents: data.rows, totalRecords: data.count });
            })
                .catch(err => {
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 500, msg: "Reference Data's not found", req: '', error: err });
                });
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ statusCode: 500, msg: errorMsg });
        }
    };
    const getReferenceById = async (req, res, next) => {
        const postData = req.body;
        // const table_name = "gender";
        // const table_name = "department";
        const table_name = postData.table_name;
        const common_tbl = db[table_name];
        console.log("START",common_tbl);
        try {
            /* gender Data */


            await common_tbl.findOne({
                
                where: { uuid: postData.Id }

            })
                .then((data) => {
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 200, req: '', responseContent: data, totalRecords: data.length });
                })
                .catch(err => {
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 500, msg: "Reference Data's not found", req: '', error: err });
                });
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({ statusCode: 500, msg: errorMsg });
        }
    };
    const addReference = async (req, res, next) => {
        const postData = req.body;
        const table_name = postData.table_name;
        // const table_name = "gender";
     
        const common_tbl = db[table_name];
 
        postData.created_by = req.body.user_uuid;
        try {
            if (postData) {
                await common_tbl.create(dynamicField(postData, table_name, 1), {
                    returning: true,
                    plain: true
                }).then(data => {
                    res.send({
                        statusCode: 200,
                        msg: "Inserted Reference Successfully",
                        req: postData,
                        responseContents: data,
                        totalRecords: data.length
                    });
                }).catch(err => {
                    if ((err && err['original'] && err['original']['errno'] == 1062)) {
                        return res
                            .status(409)
                            .json({
                                statusCode: 409,
                                error: err
                            });
                    }
                    else {
                        return res
                            .status(500)
                            .json({
                                statusCode: 500,
                                error: err
                            });
                    }
                });
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

        // postData.created_by = req.headers.user_uuid
        postData.modified_by = req.body.user_uuid;
        try {


            console.log("DATA", postData);
            await common_tbl.update(dynamicField(postData, table_name, 0), {
                // name: postData.name,
                where: { uuid: postData.Id }
            }).then((data) => {
                console.log("DATA", data);

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
        // const table_name = "department";
        const common_tbl = db[table_name];
        postData.modified_by = req.headers.user_uuid;
        try {

            if (postData.uuid) {

                await common_tbl.update({
                    is_active: postData.is_active,
                    modified_by: postData.modified_by
                }, {
                    where: { uuid: postData.uuid }
                }).then((data) => {
                    console.log('sucessmsg', data);
                    res.send({
                        statusCode: 200,
                        msg: "Deleted Successfully",
                        req: postData,
                        responseContents: data,
                        totalRecords: data.length
                    });
                }).catch(err => {
                    console.log('errormsg', err);
                    res.send({
                        status: "failed",
                        msg: "failed to delete data",
                        error: err
                    });
                });
            }
            else if (postData.id) {
                await common_tbl.update({
                    is_active: postData.is_active,
                    modified_by: postData.modified_by
                }, {
                    where: { uuid: postData.Id }
                }).then((data) => {
                    console.log('sucessmsg', data);
                    res.send({
                        statusCode: 200,
                        msg: "Deleted Successfully",
                        req: postData,
                        responseContents: data,
                        totalRecords: data.length
                    });
                }).catch(err => {
                    console.log('errormsg', err);
                    res.send({
                        status: "failed",
                        msg: "failed to delete data",
                        error: err
                    });
                });
            }
            else {
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
        //     //   revision: postData.revision,
        //     is_active: postData.is_active,
        //     //   created_date: postData.created_date,
        //     created_by: postData.created_by,
        //     //   modified_date: postData.modified_date,
        //     modified_by: postData.modified_by,
        //     uuid: uuidv4()
        //    }
        // }

        if (false) {
            postingData = {
                name: postData.name,
                code: postData.code,
                is_active: postData.is_active,
                modified_by: postData.modified_by,
                icon: postData.icon,
            };
        }
        else {
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

    // --------------------------------------------return----------------------------------
    return {
        getReference,
        addReference,
        deleteReference,
        updateReference,
        getReferenceById,
        getReferenceIdName
    };
};


module.exports = commonReferenceGroupController();