const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const multer = require('multer');
const middleware = require('../middleware/middleware');
const rp = require("request-promise");
var config = require("../config/config");
const Op = Sequelize.Op;
const specialitySketchesMasterTbl = db.speciality_sketches;
const specialitySketcheDetailsTbl = db.speciality_sketch_details;

const specialitySketchesMasterController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    * @returns {*}
    */

    const getAllSpecialitySketcheMaster_old = async (req, res, next) => {
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
    const getAllSpecialitySketcheMaster = async (req, res, next) => {
        try {
            const postData = req.body;
            let pageNo = 0;
            const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
            let sortArr = ['created_date', 'DESC'];


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
                    // p_status: 1,
                }
            };

            if (postData.search && /\S/.test(postData.search)) {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('code')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),

                ];
            }
            if (postData.codename && /\S/.test(postData.codename)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where[Op.and] = [{
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('code')), 'LIKE', '%' + postData.codename.toLowerCase()),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + postData.codename.toLowerCase()),
                        ]
                    }];
                } else {
                    findQuery.where[Op.or] = [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('code')), 'LIKE', '%' + postData.codename.toLowerCase()),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + postData.codename.toLowerCase()),
                    ];
                }
            }

            if (postData.departmentId && /\S/.test(postData.departmentId)) {
                // findQuery.where['p_department_uuid'] = postData.departmentId;      
                findQuery.where =
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('department_uuid')), 'LIKE', '%' + postData.departmentId);

            }
            if (postData.hasOwnProperty('status') && /\S/.test(postData.status)) {
                //findQuery.where['p_is_active'] = postData.status;
                findQuery.where = { is_active: postData.status };
            }
            await specialitySketchesMasterTbl.findAndCountAll(findQuery)
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

    const uploadD = multer({ storage: middleware.multerDynamicUpload('') }).any();

    const postSpecialitySketcheMaster = async (req, res) => {
        let userUUID = req.headers.user_uuid;
        try {
            if (userUUID) {
                uploadD(req, res, async (err) => {
                    const attachmentData = req.body;

                    if (err instanceof multer.MulterError) {
                        res.send({ status: 400, message: err });
                    } else if (err) {
                        res.send({ status: 400, message: err });
                    } else {
                        //attachmentData.consultation_uuid = userUUID;
                        //attachmentData.folder_name = 'ssketch';
                        attachmentData.is_active = attachmentData.status = true;
                        //attachmentData.attached_date = moment(attachmentData.attached_date).format('YYYY-MM-DD HH:mm:ss');
                        attachmentData.created_by = attachmentData.modified_by = userUUID;
                        attachmentData.created_date = attachmentData.modified_date = new Date();
                        attachmentData.revision = 1;

                        let specialityData = await specialitySketchesMasterTbl.create(attachmentData, { returning: true });
                        if (req.files.length > 0) {
                            let sketchFileSave = [];
                            for (let i = 0; i < req.files.length; i++) {
                                console.log('req.files[i].path', req.files[i].path)
                                sketchFileSave.push({
                                    speciality_sketch_uuid: specialityData.dataValues.uuid,
                                    sketch_path: req.files[i].path,
                                    status: 1,
                                    is_active: 1
                                });
                            }
                            if (sketchFileSave.length > 0) {
                                var specialitySketcheFiles = await specialitySketcheDetailsTbl.bulkCreate(sketchFileSave);

                            }

                        }
                        res.send({ "status": 200, "postData": attachmentData, "files": specialitySketcheFiles, "count": req.files.length, "message": "Inserted Speciality Sketche Master details Successfully " });
                    }
                });
            } else { return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
        }
        catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };

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
        let userUUID = req.headers.user_uuid;
        try {
            if (userUUID) {
                uploadD(req, res, async (err) => {
                    const attachmentData = req.body;
                    if (err instanceof multer.MulterError) {
                        res.send({ status: 400, message: err });
                    } else if (err) {
                        res.send({ status: 400, message: err });
                    } else {
                        let updateData = {
                            code: attachmentData.code,
                            name: attachmentData.name,
                            department_uuid: attachmentData.department_uuid,
                            description: attachmentData.description,
                            sketch_name: attachmentData.sketch_name,
                            modified_by: req.headers.user_uuid
                        }

                        await specialitySketchesMasterTbl.update(updateData,
                            {
                                where: {
                                    uuid: attachmentData.Speciality_id
                                }
                            });
                        if (req.files.length > 0) {
                            let sketchFileSave = [];
                            for (let i = 0; i < req.files.length; i++) {
                                console.log('req.files[i].path', req.files[i].path)
                                sketchFileSave.push({
                                    speciality_sketch_uuid: attachmentData.Speciality_id,
                                    sketch_path: req.files[i].path,
                                    status: true,
                                    is_active: true,
                                    modified_by: req.headers.user_uuid
                                });
                            }
                            if (sketchFileSave.length > 0) {
                                await specialitySketcheDetailsTbl.update({ is_active: 0, status: 0 }, {
                                    where: {
                                        speciality_sketch_uuid: attachmentData.Speciality_id
                                    }
                                });
                                let oldImages = JSON.parse(attachmentData.oldImages);
                                var bulkfilesUpdate = [...oldImages, ...sketchFileSave];
                                await specialitySketcheDetailsTbl.bulkCreate(bulkfilesUpdate);
                            }

                        } else {
                            await specialitySketcheDetailsTbl.update({ is_active: 0, status: 0 }, {
                                where: {
                                    speciality_sketch_uuid: attachmentData.Speciality_id
                                }
                            });
                            let oldImages = JSON.parse(attachmentData.oldImages);
                            var bulkfilesUpdate = await specialitySketcheDetailsTbl.bulkCreate(oldImages);

                        }
                        res.send({ "status": 200, "responseContents": attachmentData, "files": bulkfilesUpdate, "count": req.files.length, "message": "Updated Successfully" });
                    }
                });
            } else { return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
        }
        catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };
    const getSpecialitySketcheMasterById = async (req, res, next) => {
        const postData = req.body;
        const { user_uuid } = req.headers;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            let data = await specialitySketchesMasterTbl.findOne({
                where: {
                    uuid: postData.Speciality_id
                },
                offset: offset,
                limit: itemsPerPage,
                include: [{
                    model: specialitySketcheDetailsTbl,
                    //as: 'speciality_sketch_details',
                    //required: false,
                    // as: 'source' 
                    attributes: ['speciality_sketch_uuid', 'sketch_path', 'status', 'is_active'],
                    where: { status: 1, is_active: 1 }
                }]
            });

            const getcuDetails = await getuserDetails(user_uuid, data.created_by, req.headers.authorization);
            const getmuDetails = await getuserDetails(user_uuid, data.modified_by, req.headers.authorization);
            //const finaldata = getfinaldata(data,getcuDetails,getmuDetails);
            //data.assign({data}, )
            data.created_by = getcuDetails.responseContents.title.name + " " + getcuDetails.responseContents.first_name;
            data.modified_by = getmuDetails.responseContents.title.name + " " + getmuDetails.responseContents.first_name;
            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: 200,
                    req: '',
                    responseContents: data
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


    return {
        postSpecialitySketcheMaster,
        deleteSpecialitySketcheMaster,
        updateSpecialitySketcheMasterById,
        getSpecialitySketcheMasterById,
        getAllSpecialitySketcheMaster
    };

};
module.exports = specialitySketchesMasterController();


async function getuserDetails(user_uuid, docid, authorization) {
    console.log(user_uuid, docid, authorization);
    let options = {
        uri: config.wso2AppUrl + 'users/getusersById',
        //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/users/getusersById',
        //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
        method: "POST",
        headers: {
            Authorization: authorization,
            user_uuid: user_uuid
        },
        body: { "Id": docid },
        //body: {},
        json: true
    };
    const user_details = await rp(options);
    return user_details;
}

