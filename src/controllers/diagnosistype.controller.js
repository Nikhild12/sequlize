const httpStatus = require("http-status");
const db = require("../config/sequelize");


const Sequelize = require('sequelize');



const DiagnosisTypeTbl = db.diagnosis_type;

const DiagnosisTypeController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */


    const getDiagnosisType = async (req, res, next) => {
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
            };
        }


        try {
            await DiagnosisTypeTbl.findAndCountAll(findQuery)


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
    const getDiagnosisTypefilter = async (req, res, next) => {
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
            attributes: ['uuid','name']
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

                ],
                attr
            };
        }


        try {
            await DiagnosisTypeTbl.findAndCountAll(findQuery)


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

   
    const postDiagnosisType = async (req, res, next) => {
        const postData = req.body;
        postData.created_by = req.headers.user_uuid;


        if (postData) {

            DiagnosisTypeTbl.findAll({
                where: {
                    [Op.or]: [{
                            code: postData.code
                        },
                        {
                            name: postData.name
                        }
                    ]
                }
            }).then(async (result) => {
                if (result.length != 0) {
                    return res.send({
                        status: "error",
                        msg: "Record already Found. Please enter New DIAGNOSIS type"
                    });
                } else {
                    await DiagnosisTypeTbl.create(postData, {
                        returning: true
                    }).then(data => {

                        res.send({
                            statusCode: 200,
                            msg: "Inserted details Successfully",
                            req: postData,
                            responseContents: data
                        });
                    }).catch(err => {

                        res.send({
                            status: "failed",
                            msg: "failed to insert  details",
                            error: err
                        });
                    });

                }
            });
        } else {
            // console.log("resreresrersrsrsesresrsersesr",res)
            res.send({
                status: 'failed',
                msg: 'Please enter  diagnosis type details'
            });
        }
    };

    const getDiagnosisTypeById = async (req, res, next) => {
        const postData = req.body;
        try {
            
          
            await DiagnosisTypeTbl.findOne({
                    where: {
                        uuid: postData.Id
                    },
                   
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



    const deleteDiagnosisTypeById = async (req, res, next) => {
        const postData = req.body;

        await DiagnosisTypeTbl.update({
            is_active: 0,
            status:0
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

   
 
    const updateDiagnosisTypeById = async (req, res, next) => {
        const postData = req.body;
        postData.modified_by = req.headers.user_uuid;
        await DiagnosisTypeTbl.update(
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
        postDiagnosisType,
        getDiagnosisType,
        getDiagnosisTypeById,
        deleteDiagnosisTypeById,
        updateDiagnosisTypeById,
        getDiagnosisTypefilter

    };
};


module.exports = DiagnosisTypeController();