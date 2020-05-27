const _ = require("lodash");
const httpStatus = require("http-status");
const db = require("../config/sequelize");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
const checkDuplicate = require("../helpers/checkDuplicate.js");
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

        if (table_name && db[table_name]) {
            const common_tbl = db[table_name];


            let sortField = 'display_order';
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
            var query1;
            try {
                postingData = {
                    offset: offset,
                    limit: itemsPerPage,
                    attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
                    order: [
                        [sortField, sortOrder],
                    ],
                    where:{status:1,is_active:1},
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
                    } else {
                        query1 = {
                            [Op.or]: [
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.name')), postData.name.toLowerCase()),
                                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(table_name + '.code')), postData.name.toLowerCase())
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
                if (query1 == null) {
                    if (postData.search != null && postData.search != "") {
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
                /* gender Data */

// if (postData.is_active == 1) {
//             query1.where = { [Op.and]: [{ is_active: 1 },{status:1}] };
//         }
//         else if (postData.is_active == 0) {
//             query1.where = { [Op.and]: [{ is_active: 0 },{status:0}] };


//         }
//         else {
//             query1.where = { [Op.and]: [{ is_active: 1 },{status:1}] };

//         }
                await common_tbl.findAndCountAll(postingData).then((data) => {
                        return res
                            .status(httpStatus.OK)
                            .json({
                                statusCode: 200,
                                req: '',
                                responseContents: data.rows,
                                totalRecords: data.count
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
        } else {
            return res
            .status(httpStatus.BAD_REQUEST)
            .json({
                statusCode: 400,
                msg: "Please Provied Vaild Table Name"
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
        postData.modified_by=req.body.user_uuid;
        postData.modified_date=new Date();
        postData.created_date=new Date();
        postData.status=postData.is_active;

        try {
            if (postData &&common_tbl && db[table_name]) {
                duplicateResult = await checkDuplicate.checkExistsCreate(req.body,common_tbl,table_name);
              
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
                if(duplicateResult.count == 0) {
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
                    else{
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

duplicateResult = await checkDuplicate.checkExistsUpdate(req.body,common_tbl,tableName)
           if(duplicateResult.count == 0){
            await common_tbl.update(dynamicField(postData, table_name, 0), {
                // name: postData.name,
                where: {
                    uuid: postData.Id
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
            });}else{
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
                    status:0,
                    // modified_by: postData.modified_by
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
                 display_order:postData.display_order,
                language: postData.language,
                color:postData.color,
                Is_default:postData.Is_default,
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

    // --------------------------------------------return----------------------------------
    return {
        getReference,
        addReference,
        deleteReference,
        updateReference,
        getReferenceById,
    };
};


module.exports = commonReferenceGroupController();