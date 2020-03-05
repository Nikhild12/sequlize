const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;




const procedureNoteTemplatesTbl = db.procedure_note_templates;
const proceduresTbl = db.procedures;

const procedureNoteTemplatesController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

    const getprocedureNoteTemplates = async (req, res, next) => {
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
            where:{status: 1},
            include: [
                {
                model: proceduresTbl,
                // attributes:['uuid','name']
                }]
        };

        if (getsearch.search && /\S/.test(getsearch.search)) {

            findQuery.where = {
                [Op.or]: [{
                    code: {
                            [Op.like]: '%' + getsearch.search + '%',
                        },


                    }, {
                        name: {
                            [Op.like]: '%' + getsearch.search + '%',
                        },
                    }

                ]
            };
        }


        try {
            await procedureNoteTemplatesTbl.findAndCountAll(findQuery)


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

    const postprocedureNoteTemplates = async (req, res, next) => {
        const postData = req.body;
        postData.created_by = req.headers.user_uuid;
        if (postData) {
            await procedureNoteTemplatesTbl.create(postData, {
                returning: true
            }).then(data => {

                res.send({
                    statusCode: 200,
                    msg: "Inserted procedures note tmplate details Successfully",
                    req: postData,
                    responseContents: data
                });
            }).catch(err => {

                res.send({
                    status: "failed",
                    msg: "failed to procedures note tmplate details",
                    error: err
                });
            });
            

          
        } else {
            
            res.send({
                status: 'failed',
                msg: 'Please enter procedures note template details'
            });
        }
    };


    const deleteprocedureNoteTemplates = async (req, res, next) => {
        const postData = req.body;

        await procedureNoteTemplatesTbl.update({
            status: 0
        }, {
            where: {
                uuid: postData.Procedures_id_NT
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

    const updateprocedureNoteTemplates = async (req, res, next) => {
        const postData = req.body;
        postData.modified_by = req.headers.user_uuid;
        await procedureNoteTemplatesTbl.update(
            postData, {
                where: {
                    uuid: postData.Procedures_id_NT
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
  

    const getprocedureNoteTemplatesById = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await procedureNoteTemplatesTbl.findOne({
                    where: {
                        uuid: postData.Procedures_id_NT
                    },
                    include: [
                        {
                        model: proceduresTbl,
                        // attributes:['uuid','name']
                        }],
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

    // --------------------------------------------return----------------------------------
    return {
        getprocedureNoteTemplates,
        postprocedureNoteTemplates,
        deleteprocedureNoteTemplates,

        updateprocedureNoteTemplates,
        getprocedureNoteTemplatesById
    };
};


module.exports = procedureNoteTemplatesController();