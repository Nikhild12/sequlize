const httpStatus = require("http-status");
const db = require("../config/sequelize");
const Sequelize = require('sequelize');
const rp = require("request-promise");
var config = require("../config/config");
const Op = Sequelize.Op;
const specialitySketchesMasterTbl = db.speciality_sketches;
const specialitySketcheDetailsTbl = db.speciality_sketch_details;
const vwSpecialitySketchTbl = db.vw_speciality_sketch;

const specialityAtt = require('../attributes/vw_speciality_list.attributes');

const vwSpecialityList = db.vw_speciality_sketch_list;

const specialitySketchesMasterController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @returns {*}
    */
    const getAllSpecialitySketcheMaster = async (req, res) => {
        try {
            const postData = req.body;
            let pageNo = 0;
            const itemsPerPage = postData.paginationSize ? postData.paginationSize : 10;
            let sortArr = ['s_created_date', 'DESC'];
           
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
                limit: itemsPerPage,
                order: [
                    sortArr
                ],
                attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
                where: { s_is_active: 1, s_status: 1 }

                //     include: [{
                //         model: specialitySketcheDetailsTbl,
                //         //as: 'speciality_sketch_details',
                //         //required: false,
                //         // as: 'source' 
                //         attributes: ['speciality_sketch_uuid', 'sketch_path', 'status', 'is_active'],
                //         where: { status: 1, is_active: 1 }
                //     }]
            };

            if (postData.search && /\S/.test(postData.search)) {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('s_code')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('s_name')), 'LIKE', '%' + postData.search.toLowerCase() + '%'),

                ];
            }
            if (postData.codename && /\S/.test(postData.codename)) {
                if (findQuery.where[Op.or]) {
                    findQuery.where[Op.and] = [{
                        [Op.or]: [
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('s_code')), 'LIKE', '%' + postData.codename.toLowerCase()),
                            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('s_name')), 'LIKE', '%' + postData.codename.toLowerCase()),
                        ]
                    }];
                } else {
                    findQuery.where[Op.or] = [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('s_code')), 'LIKE', '%' + postData.codename.toLowerCase()),
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('s_name')), 'LIKE', '%' + postData.codename.toLowerCase()),
                    ];
                }
            }

            if (postData.departmentId && /\S/.test(postData.departmentId)) {
                findQuery.where =
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('s_department_uuid')), 'LIKE', '%' + postData.departmentId);

            }
            if (postData.hasOwnProperty('status') && /\S/.test(postData.status)) {
                findQuery.where = { s_is_active: postData.status };
            }
            await vwSpecialitySketchTbl.findAndCountAll(findQuery,

            )
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


    const postSpecialitySketcheMaster = async (req, res) => {
        let { user_uuid, facility_uuid, } = req.headers;
        try {

            if (user_uuid) {
                const attachmentData = req.body;
                attachmentData.is_active = Boolean(attachmentData.is_active);
                attachmentData.status = true;
                attachmentData.created_by = user_uuid;
                attachmentData.created_date = new Date();
                attachmentData.revision = 1;
                attachmentData.facility_uuid = facility_uuid;

                let specialityData = await specialitySketchesMasterTbl.create(attachmentData, { returning: true });
                if (req.files.length > 0) {
                    let sketchFileSave = [];
                    for (let i = 0; i < req.files.length; i++) {
                        sketchFileSave.push({
                            speciality_sketch_uuid: specialityData.dataValues.uuid,
                            sketch_path: req.files[i].path,
                            status: 1,
                            is_active: 1,
                            created_by: user_uuid,
                            created_date: new Date()
                        });
                    }
                    if (sketchFileSave) {
                        var specialitySketcheFiles = await specialitySketcheDetailsTbl.bulkCreate(sketchFileSave);
                    }
                }
                res.send({ "status": 200, "postData": attachmentData, "files": specialitySketcheFiles, "count": req.files.length, "message": "Inserted Speciality Sketche Master details Successfully " });
            } else { return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
        }
        catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };

    const deleteSpecialitySketcheMaster = async (req, res) => {
        const postData = req.body;

        await specialitySketchesMasterTbl.update({
            is_active: 0,
            status: 0,
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
    const updateSpecialitySketcheMasterById = async (req, res) => {
        let userUUID = req.headers.user_uuid;
        try {
            if (userUUID) {
                const attachmentData = req.body;

                // let updateData = {
                //     code: attachmentData.code,
                //     name: attachmentData.name,
                //     department_uuid: attachmentData.department_uuid,
                //     description: attachmentData.description,

                // };

                attachmentData.modified_by = userUUID;
                attachmentData.modified_date = new Date();
                const specialityUpdate = await specialitySketchesMasterTbl.update(attachmentData, {
                    where: { uuid: attachmentData.Speciality_id }
                });

                let sketchFileSave = [];
                if (req.files.length > 0 && specialityUpdate) {

                    for (let i = 0; i < req.files.length; i++) {
                        sketchFileSave.push({
                            speciality_sketch_uuid: attachmentData.Speciality_id,
                            sketch_path: req.files[i].path,
                            status: true,
                            is_active: true,
                            created_by: userUUID,
                            created_date: new Date,
                            modified_date: new Date(),
                            modified_by: userUUID
                        });
                    }
                    if (sketchFileSave.length > 0) {
                        await specialitySketcheDetailsTbl.bulkCreate(sketchFileSave);
                    }

                }

                if (attachmentData && attachmentData.delete) {
                    const spiltedValue = attachmentData['delete'].split(',');
                    if (spiltedValue && spiltedValue.length > 0) {
                        await Promise.all([
                            spiltedValue.map((s) => {
                                return specialitySketcheDetailsTbl.update(
                                    { status: 0, is_active: 0 },
                                    { where: { uuid: Number(s) } }
                                );
                            })
                        ]);
                    }
                }
                res.send({ "status": 200, "responseContents": attachmentData, "files": sketchFileSave, "count": req.files.length, "message": "Updated Successfully" });
            } else { return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
        }
        catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };
    const getSpecialitySketcheMasterById = async (req, res) => {
        const postData = req.body;
        try {
            let data = await vwSpecialityList.findAll(
                specialityAtt.getSpecialityListById(postData.Speciality_id)
            );
            if (data) {

                return res.status(httpStatus.OK).json({
                    statusCode: 200, req: '', responseContents: specialityAtt.getSpecialityResponse(data)
                });

            }
            else {
                return res
                    .status(400)
                    .json({
                        statusCode: 400,
                        req: '',
                        responseContents: "data not found"
                    });

            }

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "error",
                    msg: err
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
        //uri: config.wso2AppUrl + 'users/getusersById',
        uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/users/getusersById',
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

async function getdepDetails(user_uuid, depid, authorization) {
    console.log(depid);
    let options = {
        uri: config.wso2AppUrl + 'department/getDepartmentOnlyById',
        //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getDepartmentOnlyById',
        //   uri:
        //     "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getAllDepartments",
        method: "POST",
        headers: {
            Authorization: authorization,
            user_uuid: user_uuid
        },
        body: { "uuid": depid },
        //body: { pageNo: 0, paginationSize: 100 },
        json: true
    };
    const dep_details = await rp(options);
    return dep_details;
}

function getfulldata(data, getcuDetails, getmuDetails, getdep) {
    let newdata = {
        "uuid": data.uuid,
        "code": data.code,
        "name": data.name,
        "department_uuid": data.department_uuid,
        "department_name": getdep.responseContent ? getdep.responseContent.name : null,
        "description": data.description,
        "sketch_name": data.sketch_name,
        "status": data.status,
        "revision": data.revision,
        "is_active": data.is_active,
        "created_by_id": data.created_by,
        "created_by":
            getcuDetails.responseContents ?
                getcuDetails.responseContents.title.name + " " + getcuDetails.responseContents.first_name
                : null,
        "modified_by_id": data.modified_by,
        "modified_by":
            getmuDetails.responseContents ?
                getmuDetails.responseContents.title.name + " " + getmuDetails.responseContents.first_name
                : null,
        "created_date": data.created_date,
        "modified_date": data.modified_date,
        "speciality_sketch_detail": data.speciality_sketch_detail
    };
    return newdata;
}