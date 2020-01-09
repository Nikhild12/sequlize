const httpStatus = require("http-status");
const db = require("../config/sequelize");
const _ = require("lodash");
const emr_const = require('../config/constants');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;


const immunizationsTbl = db.immunizations;


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
   


    const getimmunization = async (req, res, next) => {
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
            where:{
                status:1
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


   
    const postimmunization = async (req, res, next) => {
        const postData = req.body;
        postData.created_by = req.headers.user_uuid;
       
        

        if (postData) {

            immunizationsTbl.findAll({
                where: {
                  [Op.or]: [
                    {
                        name: postData.name
                    }
                  ]
                }
              }).then(async (result) =>{
                if (result.length != 0) {
                    return res.send({
                        statusCode: 400,
                      status: "error",
                      msg: "Record already Found. Please enter immunizations"
                    });
                  } else{
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
            
            res.send({
                status: 'failed',
                msg: 'Please enter immunizations details'
            });
        }
    };

    const getimmunizationById = async (req, res, next) => {
        const postData = req.body;
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
    const deleteimmunizationById = async (req, res, next) => {
        const postData = req.body;

        await immunizationsTbl.update({
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
    };

   
  
    const updateimmunizationById = async (req, res, next) => {
        const postData = req.body;
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