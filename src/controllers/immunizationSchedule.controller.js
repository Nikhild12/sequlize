const httpStatus = require("http-status");
const db = require("../config/sequelize");
const _ = require("lodash");

var Sequelize = require('sequelize');
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require('../config/constants');

const immunizationScheduleTbl = db.immunization_schedule;
const immunization = db.immunizations;
const schedules = db.schedules;

const immunizationScheduleController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */


    // const getimmunizationSchedule_old = async (req, res, next) => {
    //     let getsearch = req.body;
    //     let pageNo = 0;
    //     const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
    //     let sortField = 'created_date';
    //     let sortOrder = 'DESC';
    //     if (getsearch.pageNo) {
    //         let temp = parseInt(getsearch.pageNo);
    //         if (temp && (temp != NaN)) {
    //             pageNo = temp;
    //         }
    //     }

    //     const offset = pageNo * itemsPerPage;
    //     if (getsearch.sortField) {
    //         sortField = getsearch.sortField;
    //     }
    //     if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

    //         sortOrder = getsearch.sortOrder;
    //     }
    //     let findQuery = {
    //         offset: offset,
    //         limit: itemsPerPage,
    //         order: [
    //             [sortField, sortOrder],
    //         ],
    //         where: {
    //             status: 1
    //         },
    //         include: [
    //             {
    //                 model: immunization,
    //                 attributes: ['uuid', 'name'],
    //                 required: false
    //             },
    //             {
    //                 model: schedules,
    //                 attributes: ['uuid', 'name'],
    //                 required: false
    //             }
    //         ]

    //     };
    //     if (getsearch.search && /\S/.test(getsearch.search)) {

    //         findQuery.where = {
    //             [Op.or]: [{
    //                 name: {
    //                     [Op.like]: '%' + getsearch.search + '%',
    //                 },


    //             }, {
    //                 code: {
    //                     [Op.like]: '%' + getsearch.search + '%',
    //                 },
    //             }

    //             ]
    //         };
    //     }
    //     try {
    //         await immunizationScheduleTbl.findAndCountAll(findQuery)
    //             .then((findData) => {
    //                 return res
    //                     .status(httpStatus.OK)
    //                     .json({
    //                         message: "success",
    //                         statusCode: 200,
    //                         responseContents: (findData.rows ? findData.rows : []),
    //                         totalRecords: (findData.count ? findData.count : 0),

    //                     });
    //             })
    //             .catch(err => {
    //                 console.log(err);
    //                 return res
    //                     .status(httpStatus.OK)
    //                     .json({
    //                         message: "error",
    //                         err: err,
    //                         req: ''
    //                     });
    //             });
    //     } catch (err) {
    //         const errorMsg = err.errors ? err.errors[0].message : err.message;
    //         return res
    //             .status(httpStatus.INTERNAL_SERVER_ERROR)
    //             .json({
    //                 message: "error",
    //             });
    //     }
    // };

    const getimmunizationSchedule = async (req, res, next) => {
        try {
            const postData = req.body;
            let pageNo = 0;
            const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
            let sortArr = ['uuid', 'DESC'];


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
                subQuery: false,
                offset: offset,
                limit: postData.paginationSize,
                order: [
                    sortArr
                ],
                attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
                where: {
                    status: 1
                },
                include: [
                    {
                        model: immunization,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: schedules,
                        attributes: ['uuid', 'name'],
                        required: false
                    }
                ]
            };
if (getsearch.search && /\S/.test(getsearch.search)) {

            findQuery.where = {
                [Op.or]: [{
                    immunization_name: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },


                }
                

                ]
            };
        }
            if (postData.schedule_uuid && /\S/.test(postData.schedule_uuid)) {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('immunization_schedule.schedule_uuid'))),

                ];
            }
            if (postData.immunization_name && /\S/.test(postData.immunization_name)) {
                findQuery.where = {
                    [Op.and]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('immunization_schedule.immunization_name')), postData.immunization_name.toLowerCase()),
                    ]
                };
            }

            if (postData.duration && /\S/.test(postData.duration)) {
                findQuery.where =
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('immunization_schedule.duration')));

            }

         if (postData.is_active ==1 ) {
         findQuery.where ={[Op.and]: [ {is_active:1}]};
        }
        else if(postData.is_active ==0) {
         findQuery.where ={[Op.and]: [ {is_active:0}]};


        }
        else{
         findQuery.where ={[Op.and]: [ {is_active:1}]};

        }

            await immunizationScheduleTbl.findAndCountAll(findQuery)
                .then((data) => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            statusCode: 200,
                            message: "Get Details Fetched successfully",
                            req: '',
                            responseContents: data.rows,
                            totalRecords: data.count
                        });
                })
                .catch(err => {
                    return res
                        .status(409)
                        .json({
                            statusCode: 409,
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


    const postimmunizationSchedule = async (req, res, next) => {
        const postData = req.body;
        postData.created_by = req.headers.user_uuid;



        if (postData) {

            immunizationScheduleTbl.findAll({
                where: {
                    [Op.or]: [{
                        immunization_name: postData.immunization_name
                    }]
                }
            }).then(async (result) => {
                if (result.length != 0) {
                    // return res.status(400).send({ statusCode: 400, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });

                    return res.send({
                        statusCode: 400,
                        status: "error",
                        msg: "Please enter New immunizations Schedule"
                    });
                } else {
                    await immunizationScheduleTbl.create(postData, {
                        returning: true
                    }).then(data => {

                        res.send({
                            statusCode: 200,
                            msg: "Inserted immunizations Schedule details Successfully",
                            req: postData,
                            responseContents: data
                        });
                    }).catch(err => {

                        res.send({
                            status: "failed",
                            msg: "failed to immunizations Schedule details",
                            error: err
                        });
                    });
                }
            });


        } else {

            res.send({
                 statusCode: 422,
                status: 'failed',
                msg: 'Please enter immunizations details and headers'
            });
        }
    };
    const getimmunizationScheduleById = async (req, res, next) => {
        const postData = req.body;

        const user_uuid = req.headers;

        if (user_uuid && postData.Id) {
            try {

                const page = postData.page ? postData.page : 1;
                const itemsPerPage = postData.limit ? postData.limit : 10;
                const offset = (page - 1) * itemsPerPage;
                await immunizationScheduleTbl.findOne({
                    where: {
                        uuid: postData.Id
                    },
                    include: [
                        {
                            model: immunization,
                            attributes: ['uuid', 'name'],
                            required: false
                        },
                        {
                            model: schedules,
                            attributes: ['uuid', 'name'],
                            required: false
                        }
                    ],
                    offset: offset,
                    limit: itemsPerPage,
                    order: [['uuid', 'DESC']]
                })
                    .then((data) => {
                        return res
                            .status(httpStatus.OK)
                            .json({
                                statusCode: 200,
                                req: '',
                                responseContents: data
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
        } else {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: 'No Headers Found or please provide valid request'
            });
        }
    };
    const deleteimmunizationScheduleById = async (req, res, next) => {
        const postData = req.body;

        const user_uuid = req.headers;
        if (user_uuid && postData.Id) {

            await immunizationScheduleTbl.update({
                status: 0
            }, {
                where: {
                    uuid: postData.Id
                }
            }).then((data) => {
                res.send({
                    statusCode: 200,
                    msg: "Deleted Successfully",
                    req: postData,
                    responseContents: data
                });
            }).catch(err => {
                res.send({
                    status: "failed",
                    msg: "failed to delete data",
                    error: err
                });
            });

        } else {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: 'No Headers Found or please provide valid request'
            });
        }

    };

    const updateimmunizationScheduleById = async (req, res, next) => {
        const postData = req.body;
        postData.modified_by = req.headers.user_uuid;
        await immunizationScheduleTbl.update(
            postData, {
            where: {
                uuid: postData.Id
            }
        }
        ).then((data) => {
            res.send({
                statusCode: 200,
                msg: "Updated Successfully",
                req: postData,
                responseContents: data
            });
        });

    };
    // --------------------------------------------return----------------------------------
    return {
        postimmunizationSchedule,
        getimmunizationSchedule,
        getimmunizationScheduleById,
        deleteimmunizationScheduleById,
        updateimmunizationScheduleById

    };
};


module.exports = immunizationScheduleController();
