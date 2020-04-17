const httpStatus = require("http-status");
const db = require("../config/sequelize");
const sequelizeDb = require('../config/sequelize');
// const sequelizeDb = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const rp = require("request-promise");

const templateTypeTbl = db.template_type;
const noteTemplatesTbl = db.note_templates;
const noteTypeTbl = db.note_type;
const noteTemplateTypeTbl = db.note_template_type;

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
            where: {
                is_active: 1
            }
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
            }).then(async (result) => {
                if (result.length != 0) {
                    return res.send({
                        statusCode: 400,
                        status: "error",
                        msg: "Please ente new  Note Template"
                    });
                } else {
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

    const getnoteTemplatesrById = async (req, res, next) => {
        const postData = req.body;
        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            const data = await noteTemplatesTbl.findOne({
                where: {
                    uuid: postData.Note_temp_id
                },
                include: [
                    {
                        model: noteTemplateTypeTbl,
                        required: false,
                        where: { is_active: 1, status: 1 }
                    },
                    {
                        model: noteTypeTbl,
                        required: false,
                        where: { is_active: 1, status: 1 }
                    }
                ],
                offset: offset,
                limit: itemsPerPage
            });
            if (!data) {
                return res.status(httpStatus.OK).json({ statusCode: 200, message: 'No Record Found with this Allergy Id' });
            } else {

                const getcuDetails = await getuserDetails(req.headers.user_uuid, data.created_by, req.headers.authorization);
                const getmuDetails = await getuserDetails(req.headers.user_uuid, data.modified_by, req.headers.authorization);
                const getdep = await getdepDetails(req.headers.user_uuid, data.department_uuid, req.headers.authorization);
                const getfacility = await getfacilityDetails(req.headers.user_uuid, data.facility_uuid, req.headers.authorization);
                const getdata = getfulldata(data, getcuDetails, getmuDetails, getdep, getfacility);
                return res
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        req: '',
                        responseContents: getdata
                    });
            }

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

    const getNoteTemplateByType = async (req, res, next) => {
        const postData = req.body;
        if (!postData.type) {
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: "info",
                    msg: 'Required type: <note_type_name>'
                });
        }
        try {
            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await templateTypeTbl.findOne({
                where: {
                    name: postData.type
                }
            })
                .then((data) => {
                    if (!data) {
                        return res
                            .status(httpStatus.INTERNAL_SERVER_ERROR)
                            .json({
                                status: "info",
                                msg: 'Required type: <note_type_name>'
                            });
                    }
                    return noteTemplatesTbl.findAll({
                        where: {
                            facility_uuid: req.headers.facility_uuid,
                            note_template_type_uuid: data.dataValues.uuid
                        }
                    })
                        .then((data1) => {
                            console.log('sf', data1);
                            return res
                                .status(httpStatus.OK)
                                .json({
                                    message: "success",
                                    statusCode: 200,
                                    responseContents: data1 || [],
                                    totalRecords: data1.length

                                });
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
        getnoteTemplatesrById,
        getNoteTemplateByType
    };
};


module.exports = noteTemplatesController();

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
        //uri: config.wso2AppUrl + 'department/getDepartmentOnlyById',
        uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getDepartmentOnlyById',
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

async function getfacilityDetails(user_uuid, fid, authorization) {
    
    let options = {
        //uri: config.wso2AppUrl + 'facility/getFacilityByuuid',
        uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/facility/getFacilityByuuid',
        //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
        method: "POST",
        headers: {
            Authorization: authorization,
            user_uuid: user_uuid
        },
        body: { "Id": fid },
        //body: {},
        json: true
    };
    const user_details = await rp(options);
    return user_details;
}

function getfulldata(data, getcuDetails, getmuDetails, getdep, getfacility) {
    let newdata = {
        "uuid": data.uuid,
        "code": data.code,
        "name": data.name,
        "note_template_type_uuid": data.note_template_type_uuid,
        "note_type_uuid": data.note_type_uuid,
        "facility_uuid": data.facility_uuid,
        "facility_name": getfacility.responseContents ? getfacility.responseContents.name : null,
        "department_uuid": data.department_uuid,
        "department_name": getdep.responseContent ? getdep.responseContent.name : null,
        "data_template": data.data_template,
        "is_default": data.is_default,
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
        "note_template_type": data.note_template_type,
        "note_type": data.note_type

    };
    return newdata;
}


