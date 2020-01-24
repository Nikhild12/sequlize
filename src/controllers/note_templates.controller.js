const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;



const templateTypeTbl = db.template_type;
const noteTemplatesTbl = db.note_templates;

const noteTemplatesController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

    const getnoteTemplates = async (req, res, next) => {
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
            where:{is_active: 1}
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
            await noteTemplatesTbl.findAndCountAll(findQuery)


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

    const postnoteTemplates = async (req, res, next) => {
        const postData = req.body;
        postData.created_by = req.headers.user_uuid;
       
        

        if (postData) {

            noteTemplatesTbl.findAll({
                where: {
                  [Op.or]: [{
                    code: postData.code
                    },
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
                      msg: "Record already Found. Please ente Note Template"
                    });
                  } else{
                    await noteTemplatesTbl.create(postData, {
                        returning: true
                    }).then(data => {
        
                        res.send({
                            statusCode: 200,
                            msg: "Inserted Note Template details Successfully",
                            req: postData,
                            responseContents: data
                        });
                    }).catch(err => {
        
                        res.send({
                            status: "failed",
                            msg: "failed to Note Template details",
                            error: err
                        });
                    });
                  }
              });

          
        } else {
            
            res.send({
                status: 'failed',
                msg: 'Please enter Note Template details'
            });
        }
    };


    const deletenoteTemplatesr = async (req, res, next) => {
        const postData = req.body;

        await noteTemplatesTbl.update({
            is_active: 0
        }, {
            where: {
                uuid: postData.Note_temp_id
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

    const updatenoteTemplatesById = async (req, res, next) => {
        const postData = req.body;
        postData.modified_by = req.headers.user_uuid;
        await noteTemplatesTbl.update(
            postData, {
                where: {
                    uuid: postData.Note_temp_id
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
    const getnoteTemplatesrType = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await templateTypeTbl.findOne({
                    where: {
                        name: 'Lab'
                    }
                })
                .then((data) => {
                    noteTemplatesTbl.findAll({
                        where: {
                            note_template_type_uuid: data.dataValues.uuid
                        }})
                        .then((data1) => {
                            console.log('sf',data1)
                            res.send(data1)
                        })
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

    const getnoteTemplatesrById = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await noteTemplatesTbl.findOne({
                    where: {
                        uuid: postData.Note_temp_id
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

    // --------------------------------------------return----------------------------------
    return {

        postnoteTemplates,
        getnoteTemplates,
        updatenoteTemplatesById,
        deletenoteTemplatesr,
        getnoteTemplatesrType,

        getnoteTemplatesrById
    };
};


module.exports = noteTemplatesController();