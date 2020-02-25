const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const multer = require('multer');
const middleware = require('../middleware/middleware');
const Op = Sequelize.Op;
const specialitySketchesMasterTbl = db.speciality_sketches;

const specialitySketchesMasterController = () => {
     /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

    const getAllSpecialitySketcheMaster = async (req, res, next) => {
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
            await specialitySketchesMasterTbl.findAndCountAll(findQuery)


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
    const postSpecialitySketcheMaster = async (req, res, next) => { 
        const attachments = req.body;
        console.log('-----------', req.files);
        console.log('-----------', attachments);
        return false;
        const postData = req.body;
        postData.created_by = req.headers.user_uuid;
        if (postData) {
            specialitySketchesMasterTbl.findAll({
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
                      msg: "Record already Found. Please enter Speciality Sketche Master"
                    });
                  } else {
                    await specialitySketchesMasterTbl.create(postData, {
                        returning: true
                    }).then(data => {
        
                        res.send({
                            statusCode: 200,
                            msg: "Inserted Speciality Sketche Master details Successfully",
                            req: postData,
                            responseContents: data
                        });
                    }).catch(err => {
        
                        res.send({
                            status: "failed",
                            msg: "failed to Speciality Sketche Master details",
                            error: err
                        });
                    });
                  }
              });

          
        } else {
            
            res.send({
                status: 'failed',
                msg: 'Please enter Speciality Sketche Master details'
            });
        }};
    const deleteSpecialitySketcheMaster = async (req, res, next) => {
        const postData = req.body;

        await specialitySketchesMasterTbl.update({
            is_active: 0
        }, {
            where: {
                uuid: postData.Speciality_id
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
    const updateSpecialitySketcheMasterById = async (req, res, next) => {
        const postData = req.body;
        postData.modified_by = req.headers.user_uuid;
        await specialitySketchesMasterTbl.update(
            postData, {
                where: {
                    uuid: postData.Speciality_id
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
    const getSpecialitySketcheMasterById = async (req, res, next) => {  const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await specialitySketchesMasterTbl.findOne({
                    where: {
                        uuid: postData.Speciality_id
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
        }};

        const uploadD = multer({ storage: middleware.multerDynamicUpload('') }).any();

        // const postSpecialitySketcheMaster = async (req, res) => {
        //     let userUUID = req.headers.user_uuid;
        //     try {
        //         if (userUUID) {
        //             uploadD(req, res, async (err) => {
        //                 const attachmentData = req.body;
    
        //                 if (err instanceof multer.MulterError) {
        //                     res.send({ status: 400, message: err });
        //                 } else if (err) {
        //                     res.send({ status: 400, message: err });
        //                 } else {
        //                     //attachmentData.consultation_uuid = userUUID;
        //                     attachmentData.is_active = attachmentData.status = true;
        //                     //attachmentData.attached_date = moment(attachmentData.attached_date).format('YYYY-MM-DD HH:mm:ss');
        //                     attachmentData.created_by = attachmentData.modified_by = userUUID;
        //                     attachmentData.created_date = attachmentData.modified_date = new Date();
        //                     attachmentData.sketch_path = req.files[0].path;
        //                     attachmentData.revision = 1;
        //                     await specialitySketchesMasterTbl.create(attachmentData, { returning: true });
        //                     res.send({ "status": 200, "attachment data": attachmentData, "files": req.files, "count": req.files.length, "message": "Files Uploaded Successfully " });
        //                 }
        //             });
        //         } else { return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
        //     }
        //     catch (ex) {
        //         res.send({ "status": 400, "message": ex.message });
        //     }
        // };
    return {
        postSpecialitySketcheMaster,
        deleteSpecialitySketcheMaster,
        updateSpecialitySketcheMasterById,
        getSpecialitySketcheMasterById,
        getAllSpecialitySketcheMaster
    };

};
module.exports = specialitySketchesMasterController();