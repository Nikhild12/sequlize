const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const emr_constants = require('../config/constants');



const allergyMastersTbl = db.allergy_masters;

const allergyMasterController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

    const getAllergyMaster = async (req, res, next) => {
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
            where: { is_active: 1 }
        };

        if (getsearch.search && /\S/.test(getsearch.search)) {

            findQuery.where = {
                [Op.or]: [{
                    allergey_code: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },


                }, {
                    allergy_name: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },
                }

                ]
            };
        }


        try {
            await allergyMastersTbl.findAndCountAll(findQuery)


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
                });
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    message: "error",
                });
        }


    };

    const postAlleryMaster = async (req, res, next) => {



        if (Object.keys(req.body).length != 0) {
            const postData = req.body;
            postData.created_by = req.headers.user_uuid;


            allergyMastersTbl.findAll({
                where: {
                    [Op.or]: [{
                        allergey_code: postData.allergey_code
                    },
                    {
                        allergy_name: postData.allergy_name
                    }
                    ]
                }
            }).then(async (result) => {
                if (result.length != 0) {
                    return res.send({
                        statusCode: 400,
                        status: "error",
                        msg: "Record already Found. Please enter Allergy Master"
                    });
                } else {
                    await allergyMastersTbl.create(postData, {
                        returning: true
                    }).then(data => {

                        res.send({
                            statusCode: 200,
                            msg: "Inserted Allery Master details Successfully",
                            req: postData,
                            responseContents: data
                        });
                    }).catch(err => {

                        res.send({
                            status: "failed",
                            msg: "failed to Allery Master details",
                            error: err
                        });
                    });
                }
            });


        } else {

            res.send({
                status: 'failed',
                msg: 'No Request Body Found'
            });
        }
    };


    const deleteAlleryMaster = async (req, res, next) => {
        if (Object.keys(req.body).length != 0) {
            const postData = req.body;
            if (postData.Allergy_id <= 0) {
                return res.status(400).send({ code: 400, message: 'Please provide Valid id' });

            }

            await allergyMastersTbl.update({
                is_active: 0
            }, {
                where: {
                    uuid: postData.Allergy_id
                }
            }).then((data) => {
                res.send({
                    statusCode: 200,
                    msg: "Deleted Successfully",
                    req: postData,
                    responseContents: data
                });
            }).catch(err => {
                console.log(err.message);
                res.send({
                    status: "failed",
                    msg: "failed to delete data",
                    error: err.message
                });
            });
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });

        }
    };
    const updateAlleryMasterById = async (req, res, next) => {
        if (Object.keys(req.body).length != 0) {
            const postData = req.body;

            postData.modified_by = req.headers.user_uuid;
            await allergyMastersTbl.update(
                postData, {
                where: {
                    uuid: postData.Allergy_id
                }
            }
            ).then((data) => {
                res.send({
                    statusCode: 200,
                    msg: "Updated Successfully",
                    req: postData,
                    responseContents: data
                });
            }).catch(err => {
                console.log(err.message);
                res.send({
                    status: "failed",
                    msg: "failed to update data",
                    error: err.message
                });
            });
        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
        }

    };


    const getAlleryMasterById = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await allergyMastersTbl.findOne({
                where: {
                    uuid: postData.Allergy_id
                },
                offset: offset,
                limit: itemsPerPage
            })
                .then((data) => {
                    if (!data) {
                        return res.status(httpStatus.OK).json({ statusCode: 404, message: emr_constants.NO_RECORD_FOUND });
                    }
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
    };

    // --------------------------------------------return----------------------------------
    return {

        postAlleryMaster,
        getAllergyMaster,
        updateAlleryMasterById,
        deleteAlleryMaster,

        getAlleryMasterById
    };
};


module.exports = allergyMasterController();