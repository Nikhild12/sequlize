const httpStatus = require("http-status");
const db = require("../config/sequelize");
const _ = require("lodash");

var Sequelize = require('sequelize');



const immunizationScheduleTbl = db.chief_complaints;

const immunizationScheduleController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */


    const getimmunizationSchedule = async (req, res, next) => {
        let getsearch = req.body;

        let pageNo = 0;
        const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
        let sortField = 'created_date';
        let sortOrder = 'DESC';

        if (getsearch.pageNo) {
            let temp = parseInt(getsearch.pageNo);


            if (temp && (temp != NaN)) {
                pageNo = temp;
            }
        }

        const offset = pageNo * itemsPerPage;


        if (getsearch.sortField) {

            sortField = getsearch.sortField;
        }

        if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

            sortOrder = getsearch.sortOrder;
        }
        let findQuery = {
            offset: offset,
            limit: itemsPerPage,
            order: [
                [sortField, sortOrder],
            ],

        };

        if (getsearch.search && /\S/.test(getsearch.search)) {

            findQuery.where = {
                [Op.or]: [{
                        name: {
                            [Op.like]: '%' + getsearch.search + '%',
                        },


                    }, {
                        code: {
                            [Op.like]: '%' + getsearch.search + '%',
                        },
                    }

                ]
            }
        }


        try {
            await immunizationsTbl.findAndCountAll(findQuery)


                .then((findData) => {

                    return res

                        .status(httpStatus.OK)
                        .json({
                            message: "success",
                            statusCode: 200,
                            responseContents: (findData.rows ? findData.rows : []),
                            totalRecords: (findData.count ? findData.count : 0),

                        });
                })
                .catch(err => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            message: "error",
                            err: err,
                            req: ''
                        });
                })
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    message: "error",
                });
        }


    };


    const postimmunizationSchedule = async (req, res, next) => {
        const postData = req.body;
        postData.created_by = req.headers.user_uuid
        
        if (postData) {
            await immunizationsTbl.create(postData, {
                returning: true
            }).then(data => {

                res.send({
                    statusCode: 200,
                    msg: "Inserted Immunization Schedule Successfully",
                    req: postData,
                    responseContents: data
                })
            }).catch(err => {

                res.send({
                    status: "failed",
                    msg: "failed to Immunization Schedule details",
                    error: err
                })
            })
        } else {

            res.send({
                status: 'failed',
                msg: 'Please enter Immunization Schedule'
            })
        }
    }
  
    const getimmunizationScheduleById = async (req, res, next) => {
        const postData = req.body
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await immunizationsTbl.findOne({
                    where: {
                        uuid: postData.Id
                    },
                    offset: offset,
                    limit: itemsPerPage
                })
                .then((data) => {
                    return res
                        .status(httpStatus.OK)
                        .json({
                            statusCode: 200,
                            req: '',
                            responseContents: data
                        });
                })

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
    const deleteimmunizationScheduleById = async (req, res, next) => {
        const postData = req.body

        await immunizationScheduleTbl.update({
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
            })
        }).catch(err => {
            res.send({
                status: "failed",
                msg: "failed to delete data",
                error: err
            })
        })
    }

   
    
  
    const updateimmunizationScheduleById = async (req, res, next) => {
        const postData = req.body
        postData.modified_by = req.headers.user_uuid
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
            })
        })

    }
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