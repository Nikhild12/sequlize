const httpStatus = require("http-status");
const db = require("../config/sequelize");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
const emr_const = require('../config/constants');

const vw_uom_diagnosis = db.vw_uom_diagnosis;
const diagnosisTbl = db.diagnosis;

const emr_utilites = require("../services/utility.service");


function getDiagnosisFilterByQuery(searchBy, searchValue) {
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
                },
                {
                    code: {
                        [Op.like]: `%${searchValue}%`,
                    }
                }
                ]
            };


        case 'dignosisId':
        default:
            searchValue = +searchValue;
            return {
                is_active: emr_const.IS_ACTIVE,
                status: emr_const.IS_ACTIVE,
                uuid: searchValue
            };
    }
}

function getDiagnosisAttributes() {
    return [
        'uuid',
        'code',
        'name',
        'description',
        'diagnosis_scheme_uuid',
        'diagnosis_type_uuid',
        'diagnosis_category_uuid',
        'diagnosis_grade_uuid',
        'diagnosis_region_uuid',
        'diagnosis_version_uuid',
        'speciality',
        'synonym',
        'referrence_link',
        'length_Of_stay',
        'body_site_uuid',
        'side_uuid',
        'position_id',
        'in_house',
        'is_notifibale',
        'is_sensitive',
        'is_billable',
        'facility_uuid',
        'department_uuid',
        'comments',
        'is_active',
        'status',
        'revision',
        'created_by',
        'created_date',
        'modified_by',
        'modified_date'
    ];
}

function getDiagnosisversion() {
    return [
        'uuid',
        'code',
        'name'
    ];
}
const diagnosisController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    const _getDiagnosisFilter = async (req, res) => {


        const {
            user_uuid
        } = req.headers;
        const {
            searchBy,
            searchValue
        } = req.query;

        if (user_uuid && searchBy && searchValue) {

            try {
                const diagnosisData = await diagnosisTbl.findAll({
                    where: getDiagnosisFilterByQuery(searchBy, searchValue),
                    attributes: getDiagnosisAttributes()
                });
                if (diagnosisData && diagnosisData.length > 0) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: "Fetched Diagnosis Data Successfully",
                        responseContents: diagnosisData ? diagnosisData : []
                    });
                } else {
                    return res.status(200).send({ code: httpStatus.OK, message: 'No Record Found' });
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
    const _getDiagnosisSearch = async (req, res) => {
        const {
            user_uuid
        } = req.headers;
        const { searchValue, paginationSize, pageNo } = req.body;
        if (user_uuid && searchValue) {
            try {
                let pageno = 0;
                const itemsPerPage = paginationSize ? paginationSize : 10;
                if (pageNo) {
                    let temp = parseInt(pageNo);
                    if (temp && (temp != NaN)) {
                        pageno = temp;
                    }
                }
                const offset = pageno * itemsPerPage;
                const diagnosisData = await diagnosisTbl.findAndCountAll({
                    where: getDiagnosisFilterByQuery("filterbythree", searchValue),
                    attributes: getDiagnosisAttributes().splice(0, 3),
                    offset: offset,
                    limit: itemsPerPage
                });
                if (diagnosisData) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: "Fetched Diagnosis Data Successfully",
                        responseContents: diagnosisData.rows,
                        totalRecords: diagnosisData.count,
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

    const _createDiagnosis = async (req, res) => {
        const {
            user_uuid
        } = req.headers;
        const diagnosisData = req.body;
        if (Object.keys(req.body).length != 0) {

            if (user_uuid && diagnosisData) {

                try {

                    const code_exits = await codeexists(req.body.code);
                    const name_exits = await nameexists(req.body.name);
                    const tblname_exits = await codenameexists(req.body.code, req.body.name);

                    if (tblname_exits && tblname_exits.length > 0) {
                        return res
                            .status(400)
                            .send({ code: 400, message: "code and name already exists" });
                    }
                    else if (code_exits && code_exits.length > 0) {
                        return res
                            .status(400)
                            .send({ code: 400, message: "code already exists" });

                    } else if (name_exits && name_exits.length > 0) {
                        return res
                            .status(400)
                            .send({ code: 400, message: "name already exists" });

                    } else {

                        diagnosisData.code = diagnosisData.code;
                        diagnosisData.name = req.body.name;
                        diagnosisData.diagnosis_scheme_uuid = req.body.diagnosis_scheme_uuid;
                        diagnosisData.diagnosis_type_uuid = req.body.diagnosis_type_uuid;
                        diagnosisData.diagnosis_category_uuid = req.body.diagnosis_category_uuid;
                        diagnosisData.diagnosis_grade_uuid = req.body.diagnosis_grade_uuid;
                        diagnosisData.diagnosis_region_uuid = req.body.diagnosis_region_uuid;
                        diagnosisData.position_id = req.body.position_id;

                        diagnosisData.description = diagnosisData.description;
                        diagnosisData.is_active = diagnosisData.status = emr_const.IS_ACTIVE;
                        diagnosisData.created_by = diagnosisData.modified_by = user_uuid;
                        diagnosisData.created_date = diagnosisData.modified_date = new Date();
                        diagnosisData.revision = 1;

                        const diagnosisCreatedData = await diagnosisTbl.create(diagnosisData, {
                            returning: true
                        });

                        if (diagnosisCreatedData) {
                            diagnosisData.uuid = diagnosisCreatedData.uuid;
                            return res.status(200).send({
                                code: 200,
                                message: "Inserted Diagnosis Successfully",
                                responseContents: diagnosisData
                            });
                        }
                    }
                } catch (ex) {

                    return res.status(400).send({
                        code: 400,
                        message: ex.message
                    });
                }
            } else {
                return res.status(400).send({
                    code: 400,
                    message: 'No Headers Found'
                });
            }
        } else {
            return res
                .status(400)
                .send({ code: httpStatus[400], message: "No Request Body Found" });
        }

    };

    const _getDiagnosis = async (req, res, next) => {

        let getsearch = req.body;

        // Object.keys(getsearch).forEach((key) => (getsearch[key] == null || getsearch[key] == "") && delete getsearch[key]);

        let pageNo = 0;
        const itemsPerPage = getsearch.paginationSize ? getsearch.paginationSize : 10;
        let sortField = 'name';
        let sortOrder = 'ASC';

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
            order: [[sortField, sortOrder]],
            attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },
            where: { is_active: 1, status: 1 }

        };

        if (getsearch.search && /\S/.test(getsearch.search)) {
            findQuery.where[Op.or] = [
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_uom_diagnosis.name')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),
                Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_uom_diagnosis.code')), 'LIKE', '%' + getsearch.search.toLowerCase() + '%'),

            ];
        }
        if (getsearch.diagnosis_version_uuid && /\S/.test(getsearch.diagnosis_version_uuid)) {
            if (findQuery.where[Op.or]) {
                findQuery.where[Op.and] = [{
                    [Op.or]: [
                        Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_uom_diagnosis.diagnosis_version_uuid')), getsearch.diagnosis_version_uuid)
                    ]
                }];
            } else {
                findQuery.where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('vw_uom_diagnosis.diagnosis_version_uuid')), getsearch.diagnosis_version_uuid)
                ];
            }
        }

        if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
            findQuery.where['is_active'] = getsearch.status;
        }



        try {
            console.log(findQuery);
            const data = await vw_uom_diagnosis.findAndCountAll(findQuery);

            if (data) {
                return res
                    .status(httpStatus.OK)
                    .json({
                        message: "success",
                        statusCode: 200,
                        responseContents: (data.rows ? data.rows : []),
                        totalRecords: (data.count ? data.count : 0),

                    });
            }

        } catch (err) {

            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(400)
                .send({ code: httpStatus.BAD_REQUEST, message: err.message });
        }


    };

    const _deleteDiagnosis = async (req, res) => {

        // plucking data req body
        const {
            Id
        } = req.body;
        const {
            user_uuid
        } = req.headers;

        if (Id) {
            const updateddiagnosisData = {
                status: 0,
                is_active: 0,
                modified_by: user_uuid,
                modified_date: new Date()
            };
            try {

                const updateddiagnosissAsync = await Promise.all(
                    [
                        diagnosisTbl.update(updateddiagnosisData, {
                            where: {
                                uuid: Id
                            }
                        })

                    ]
                );

                if (updateddiagnosissAsync) {
                    return res.status(200).send({
                        code: 200,
                        message: "Deleted Successfully"
                    });
                }

            } catch (ex) {
                return res.status(400).send({
                    code: 400,
                    message: ex.message
                });
            }

        } else {
            return res.status(400).send({
                code: 400,
                message: "No Request Body Found"
            });
        }

    };
    const _updateDiagnosisById = async (req, res, next) => {
        const postData = req.body;
        postData.modified_by = req.headers.user_uuid;
        await diagnosisTbl.update(
            postData, {
            where: {
                uuid: postData.Diagnosis_id
            }
        }
        ).then((data) => {
            res.send({
                code: 200,
                msg: "Updated Successfully",
                req: postData,
                responseContents: data
            });
        });

    };
    const _getDaignosisByUUId = async (req, res, next) => {
        const postData = req.body;

        try {

            const data = await vw_uom_diagnosis.findOne({
                where: {
                    uuid: postData.Diagnosis_id,
                },
                attributes: { "exclude": ['id', 'createdAt', 'updatedAt'] },

            });
            if (data) {
                return res
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        req: '',
                        responseContents: data
                    });
            }

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(400)
                .send({ code: httpStatus.BAD_REQUEST, message: err.message });
        }
    };


    const _getDaignosisById = async (req, res, next) => {
        // console.log('_getDaignosisById...........', req.body);
        const postData = req.body;
        try {
            if (postData.Diagnosis_id <= 0) {
                return res.status(400).send({ code: 400, message: 'Please provide Valid  id' });

            }
            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
            await diagnosisTbl.findOne({
                where: {
                    uuid: postData.Diagnosis_id
                },
                offset: offset,
                limit: itemsPerPage,
                attributes: getDiagnosisAttributes(),
                // include: [{
                //     model: allergySourceTbl,
                //     required:false,
                //     // as: 'source' 
                //     attributes: ['uuid','name'],
                //     where: {status: 1, is_active: 1}
                // }
                // ,
                // {
                //     model: allergySeverityTbl,
                //     required:false,
                //     // as: 'source' 
                //     attributes: ['uuid','name'],
                //     where: {status: 1, is_active: 1}
                // }
                // ]
            })
                .then((data) => {
                    if (!data) {
                        return res.status(httpStatus.OK).json({ statusCode: 200, message: 'No Record Found with this Id' });
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

    const _getdiagnosisAutoSearch = async (req, res) => {
        const { user_uuid } = req.headers;
        const { searchValue } = req.body;
        let sortField = 'name';
        let sortOrder = 'ASC';

        const isValidSearchVal = searchValue && emr_utilites.isStringValid(searchValue);
        if (searchValue && isValidSearchVal && user_uuid) {
            try {
                const diagnosisAutoSearchData = await diagnosisTbl.findAll({
                    order: [[sortField, sortOrder]],
                    where: emr_utilites.getFilterByThreeQueryForCodeAndName(searchValue),
                    attributes: getDiagnosisAttributes()
                });

                if (diagnosisAutoSearchData && diagnosisAutoSearchData.length > 0) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: "Fetched Diagnosis Data Successfully",
                        responseContents: diagnosisAutoSearchData ? diagnosisAutoSearchData : []
                    });
                } else {
                    return res.status(200).send({ code: httpStatus.OK, message: 'No Record Found' });
                }
            } catch (ex) {
                console.log('Exception Happened', ex);
                return res.status(400).send({ statusCode: httpStatus.BAD_REQUEST, message: ex.message });
            }
        } else {
            return res.status(400).send({
                code: httpStatus[400],
                message: `${emr_const.NO} ${emr_const.NO_USER_ID} ${emr_const.OR} ${emr_const.NO_REQUEST_BODY} ${emr_const.FOUND}`
            });
        }

    };
    // --------------------------------------------return----------------------------------
    return {
        getDiagnosisFilter: _getDiagnosisFilter,
        createDiagnosis: _createDiagnosis,
        getDiagnosisSearch: _getDiagnosisSearch,
        getdiagnosisAutoSearch: _getdiagnosisAutoSearch,
        getDiagnosis: _getDiagnosis,
        deleteDiagnosis: _deleteDiagnosis,
        updateDiagnosisById: _updateDiagnosisById,
        getDaignosisById: _getDaignosisById,
        getDaignosisByUUId: _getDaignosisByUUId

    };
};


module.exports = diagnosisController();

const codeexists = (code, userUUID) => {
    if (code !== undefined) {
        return new Promise((resolve, reject) => {
            let value = diagnosisTbl.findAll({
                //order: [['created_date', 'DESC']],
                attributes: ["code"],
                where: { code: code }
            });
            if (value) {
                resolve(value);
                return value;
            } else {
                reject({ message: "code does not existed" });
            }
        });
    }
};

const nameexists = (name) => {
    if (name !== undefined) {
        return new Promise((resolve, reject) => {
            let value = diagnosisTbl.findAll({
                //order: [['created_date', 'DESC']],
                attributes: ["name"],
                where: { name: name }
            });
            if (value) {
                resolve(value);
                return value;
            } else {
                reject({ message: "code does not existed" });
            }
        });
    }
};

const codenameexists = (code, name) => {
    if (code !== undefined && name !== undefined) {
        return new Promise((resolve, reject) => {
            let value = diagnosisTbl.findAll({
                //order: [['created_date', 'DESC']],
                attributes: ["code", "name"],
                where: { code: code, name: name }
            });
            if (value) {
                resolve(value);
                return value;
            } else {
                reject({ message: "code does not existed" });
            }
        });
    }
};

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
        "code": data.uuid,
        "name": data.uuid,
        "description": data.uuid,
        "diagnosis_scheme_uuid": data.uuid,
        "diagnosis_type_uuid": data.uuid,
        "diagnosis_category_uuid": data.uuid,
        "diagnosis_grade_uuid": data.uuid,
        "diagnosis_region_uuid": data.uuid,
        "diagnosis_version_uuid": data.uuid,
        "speciality": data.uuid,
        "synonym": data.uuid,
        "referrence_link": data.uuid,
        "length_Of_stay": data.uuid,
        "body_site_uuid": data.uuid,
        "side_uuid": data.uuid,
        "position_id": data.uuid,
        "in_house": data.uuid,
        "is_notifibale": data.uuid,
        "is_sensitive": data.uuid,
        "is_billable": data.uuid,
        "facility_uuid": data.uuid,
        "department_uuid": data.uuid,
        "department_name": getdep.responseContent.name,
        "comments": data.uuid,
        "is_active": data.uuid,
        "status": data.uuid,
        "revision": data.uuid,
        "created_by_id": data.created_by,
        "created_by": getcuDetails.responseContents.title.name + " " + getcuDetails.responseContents.first_name,
        "modified_by_id": data.modified_by,
        "modified_by": getmuDetails.responseContents.title.name + " " + getmuDetails.responseContents.first_name,
        "diagnosis_version": data.diagnosis_version,
        "diagnosis_grade": data.diagnosis_grade,
        "body_side": data.body_side,
        "body_site": data.body_site,
        "diagnosis_region": data.diagnosis_region,
        "position": data.position,
        "diagnosis_category": data.diagnosis_category,
        "diagnosis_scheme": data.diagnosis_scheme,
        "diagnosis_type": data.diagnosis_type

    };
    return newdata;
}

