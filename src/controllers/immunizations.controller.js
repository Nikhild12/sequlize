const httpStatus = require("http-status");
const db = require("../config/sequelize");
const _ = require("lodash");
const emr_const = require('../config/constants');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
const utility = require('../services/utility.service')
const immunizationsTbl = db.immunizations;
const immunizationsVwTbl = db.vw_emr_immunizations;
const emr_constants = require('../config/constants');

function getimmunizationsFilterByQuery(searchBy, searchValue) {
    searchBy = searchBy.toLowerCase();
    switch (searchBy) {
        case 'filterbythree':

            return {
                is_active: emr_const.IS_ACTIVE,
                status: emr_const.IS_ACTIVE,
                [Op.or]: [{
                    name: {
                        [Op.like]: `%${searchValue}%`
                    }
                }

                ]
            };


        case 'immunizationId':
        default:
            searchValue = +searchValue;
            return {
                is_active: emr_const.IS_ACTIVE,
                status: emr_const.IS_ACTIVE,
                uuid: searchValue
            };
    }
}

function getimmunizationsDataAttributes() {
    return [
        'uuid',

        'name',
        'description',
        'route_uuid',
        'frequency_uuid',
        'duration',
        'period_uuid',
        'instruction_uuid',
        'schedule_flag_uuid',
        'is_active',
        'status',
        'revision',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date'
    ];
}

const immunizationsController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */



    const getimmunization_old = async (req, res, next) => {
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
            where: {
                status: 1
            }

        };

        if (getsearch.search && /\S/.test(getsearch.search)) {

            findQuery.where = {
                [Op.or]: [{
                    name: {
                        [Op.like]: '%' + getsearch.search + '%',
                    },


                }

                ]
            };
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

    const getimmunization_old1 = async (req, res, next) => {
        let getsearch = req.body;

        let pageNo = 0;
        const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
        let sortField = 'i_created_date';
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
            where: {
                i_is_active: 1
            }

        };

        if (getsearch.search && /\S/.test(getsearch.search)) {

            findQuery.where = {
                [Op.or]: [{
                    i_name: {
                        [Op.like]: '%' + getsearch.search + '%',
                    }
                }, {
                    df_name: {
                        [Op.like]: '%' + getsearch.search + '%',
                    }
                },
                {
                    i_status: {
                        [Op.like]: '%' + getsearch.search + '%',
                    }
                }

                ]
            };
        }


        try {
            await immunizationsVwTbl.findAndCountAll(findQuery)


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

    const getimmunization = async (req, res, next) => {
        try {
            const getsearch = req.body;
            let pageNo = 0;
            const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
            let sortArr = ['i_modified_date', 'DESC'];


            if (getsearch.pageNo) {
                let temp = parseInt(getsearch.pageNo);
                if (temp && (temp != NaN)) {
                    pageNo = temp;
                }
            }
            const offset = pageNo * itemsPerPage;
            let fieldSplitArr = [];
            if (getsearch.sortField) {
                if (getsearch.sortField == 'modified_date'){
                    getsearch.sortField = 'i_modified_date';
                }
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
                where: { i_is_active:1},
                order: [
                    sortArr
                ],
                attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
                
            };

           
            if (getsearch.search && /\S/.test(getsearch.search)) {
            findQuery.where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunizations.i_name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
           // Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunizations.i_code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

           ];
           }
           if (getsearch.name && /\S/.test(getsearch.name)) {
           if (findQuery.where[Op.or]) {
           findQuery.where[Op.and] = [{
                          [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunizations.i_name')), getsearch.name.toLowerCase())]
           }];
           } else {
           findQuery.where[Op.or] = [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunizations.i_name')), getsearch.name.toLowerCase())];
           }
           }
           if (getsearch.frequency_uuid && /\S/.test(getsearch.frequency_uuid)) {
           if (findQuery.where[Op.or]) {
               findQuery.where[Op.and] = [{
                          [Op.or]: [Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunizations.i_frequency_uuid')), getsearch.frequency_uuid)]
           }];
           } else {
          findQuery.where[Op.or] = [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_emr_immunizations.i_frequency_uuid')), getsearch.frequency_uuid)
          ];
          }
          }
   
          if (getsearch.hasOwnProperty('i_is_active') && /\S/.test(getsearch.i_is_active)) {          
            findQuery.where['i_is_active'] = (getsearch.i_is_active == true || getsearch.i_is_active == 'true' || getsearch.i_is_active == 1 ) ? 1 : 0;
        //   findQuery.where['i_status'] = getsearch.status;

          }
          if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
          //findQuery.where['i_is_active'] = getsearch.status;
           findQuery.where['i_status'] = getsearch.status;

          }
      
        
            await immunizationsVwTbl.findAndCountAll(findQuery)
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


    const postimmunization = async (req, res, next) => {
        let postData = req.body;
        postData.created_by = req.headers.user_uuid;
        postData.modified_by = req.headers.user_uuid;
        // postData.status=postData.is_active;
        if (Object.keys(postData).length != 0) {
            
            immunizationsTbl.findAll({
                where: {
                    [Op.or]: [
                        {
                            name: postData.name
                        }
                    ]
                }
            }).then(async (result) => {
                if (result.length != 0) {
                    // return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });

                    return res.send({
                        statusCode: 400,
                        status: "error",
                        msg: "Name already exists"
                    });
                } else {
                    await immunizationsTbl.create(postData, {
                        returning: true
                    }).then(data => {

                        res.send({
                            statusCode: 200,
                            msg: "Inserted immunizations details Successfully",
                            req: postData,
                            responseContents: data
                        });
                    }).catch(err => {

                        res.send({
                            status: "failed",
                            msg: "failed to immunizations details",
                            error: err
                        });
                    });
                }
            });


        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    };

   
    
    const getimmunizationById = async (req, res, next) => {
        const postData = req.body;

        const user_uuid = req.headers;
        if (user_uuid && postData.Id) {
            try {

                const page = postData.page ? postData.page : 1;
                const itemsPerPage = postData.limit ? postData.limit : 10;
                const offset = (page - 1) * itemsPerPage;
                await immunizationsVwTbl.findAll({
                    where: {
                        i_uuid: postData.Id
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
    const deleteimmunizationById = async (req, res, next) => {
        const postData = req.body;
        const user_uuid = req.headers;
        if (user_uuid && postData.Id) {
            await immunizationsTbl.update({
                status: 0,
                is_active:0
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
                    statusCode: 400,
                    status: "failed",
                    msg: "failed to delete data",
                    error: err
                });
            });
        }
        else {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: 'No Headers Found or please provide valid request'
            });
        }
    };



    const updateimmunizationById = async (req, res, next) => {
        let postData = req.body;
        postData.status=postData.is_active;
        if (Object.keys(postData).length != 0) {
            if (postData.Id && req.headers.user_uuid) {
                

                postData.modified_by = req.headers.user_uuid;

                
                await immunizationsTbl.update(
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

            }
            else {
                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: 'No Headers Found and id not found'
                });
            }
        }
        else {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: 'No Headers Found and id not found'
            });
        }
    };
    const searchimmuization = async (req, res, next) => {
        const {
            user_uuid
        } = req.headers;
        const {
            searchValue
        } = req.body;


        if (user_uuid && searchValue) {

            try {
                const page = searchValue.page ? searchValue.page : 1;
                const itemsPerPage = searchValue.limit ? searchValue.limit : 50;
                const offset = (page - 1) * itemsPerPage;
                const immunizationsData = await immunizationsTbl.findAll({
                    where: getimmunizationsFilterByQuery("filterbythree", searchValue),
                    attributes: getimmunizationsDataAttributes(),
                    offset: offset,
                    limit: itemsPerPage
                });

                if (immunizationsData) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: "Fetched immunizationsData Data Successfully",
                        responseContents: immunizationsData,

                    });
                }
            } catch (error) {

                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: error.message
                });
            }
        } else {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: 'No Headers Found'
            });
        }
    };


    // --------------------------------------------return----------------------------------
    return {
        postimmunization,
        getimmunization,
        getimmunizationById,
        deleteimmunizationById,
        updateimmunizationById,
        searchimmuization,

    };
};


module.exports = immunizationsController();