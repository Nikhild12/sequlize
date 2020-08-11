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
const scheduleflagsTbl = db.schedule_flags;
const vw_immunische = db.vw_emr_immunization_schedule;

const routestbl = db.routes;

const immunizationScheduleController = () => {


    const getimmunizationSchedule = async (req, res, next) => {
        try {
            const getsearch = req.body;
            let pageNo = 0;
            const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
            let sortArr = ['modified_date', 'DESC'];


            if (getsearch.pageNo) {
                let temp = parseInt(getsearch.pageNo);
                if (temp && (temp != NaN)) {
                    pageNo = temp;
                }
            }
            const offset = pageNo * itemsPerPage;
            let fieldSplitArr = [];
            if (getsearch.sortField) {
                fieldSplitArr = getsearch.sortField.split('.');
                if (fieldSplitArr.length == 1) {
                    sortArr[0] = getsearch.sortField;
                } else {
                    for (let idx = 0; idx < fieldSplitArr.length; idx++) {
                        const element = fieldSplitArr[idx];
                        fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
                    }
                    sortArr = fieldSplitArr;
                }
            }
            if (getsearch.sortOrder && ((getsearch.sortOrder.toLowerCase() == 'asc') || (getsearch.sortOrder.toLowerCase() == 'desc'))) {
                if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
                    sortArr[1] = getsearch.sortOrder;
                } else {
                    sortArr.push(getsearch.sortOrder);
                }
            }
            let findQuery = {
                subQuery: false,
                offset: offset,
                limit: getsearch.paginationSize,
                order: [
                    sortArr
                ],
                attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
                where: {
                }
            };
            if (getsearch.search && /\S/.test(getsearch.search)) {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunization_schedule.schedule_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunization_schedule.immunization_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunization_schedule.dr_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunization_schedule.dp_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),


                ];
            }
            if (getsearch.schedule_uuid && /\S/.test(getsearch.schedule_uuid)) {
                findQuery.where['$vw_emr_immunization_schedule.schedule_uuid$'] = getsearch.schedule_uuid;
            }

            if (getsearch.immunization_uuid && /\S/.test(getsearch.immunization_uuid)) {
                findQuery.where['$vw_emr_immunization_schedule.immunization_uuid$'] = getsearch.immunization_uuid;
            }

            if (getsearch.duration_period_uuid && /\S/.test(getsearch.duration_period_uuid)) {
                findQuery.where['$vw_emr_immunization_schedule.duration_period_uuid$'] = getsearch.duration_period_uuid;
            }

  if (getsearch.status && (getsearch.status.toLowerCase() == "active" || getsearch.status.toLowerCase() == "inactive")) {
        let is_active_input = 0;
        if (getsearch.status.toLowerCase() == "active") {
          is_active_input = 1;
        } else {
          is_active_input = 0;
        }
        findQuery.where = Object.assign(findQuery.where, {
          is_active: {
            [Op.eq]: is_active_input
          }
        });
      } else {
        findQuery.where = Object.assign(findQuery.where, {
          is_active: {
            [Op.eq]: 1
          }
        });
      }

  
    // if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
    //     findQuery.where['is_active'] = getsearch.status;
    //     // findQuery.where['status'] = getsearch.status;
    //  }     
            await vw_immunische.findAndCountAll(findQuery)
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
        let postData = req.body;
        postData.status = postData.is_active;
        postData.created_by = req.headers.user_uuid;
        postData.modified_by = req.headers.user_uuid;
        postData.created_date = new Date();
        postData.modifed_date = new Date();

        if (postData) {

            immunizationScheduleTbl.findAll({
                where: {
                    [Op.and]: [{
                        immunization_uuid: postData.immunization_uuid
                    },
                    {
                        schedule_uuid: postData.schedule_uuid
                    },
                    ]
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

                    immunizationScheduleTbl.findAll({
                        where: {
                            display_order: postData.display_order
                        }
                    }).then(async (resultd) => {
                        if (resultd.length != 0 && postData.display_order != "") {
                            // return res.status(400).send({ statusCode: 400, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });

                            return res.send({
                                statusCode: 400,
                                status: "error",
                                msg: "Please enter New display order immunizations Schedule"
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
                await vw_immunische.findOne({
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
                    order: [['uuid', 'DESC']],
                    // status: 1,
                    // is_active: 1
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
                status: 0,
                is_active: 0
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
        let postData = req.body;
        // postData.status=postData.is_active;

        postData.modified_by = req.headers.user_uuid;
        postData.modifed_date = new Date();
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
