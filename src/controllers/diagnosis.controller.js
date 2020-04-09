const httpStatus = require("http-status");
const db = require("../config/sequelize");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
const emr_const = require('../config/constants');
const diagnosisTbl = db.diagnosis;
const diagverTb = db.diagnosis_version;
const diagregionTb = db.diagnosis_region;
const positionsTb = db.positions;
const diaggradeTb = db.diagnosis_grade;
const diagcatTb = db.diagnosis_category;
const diagtypetb = db.diagnosis_type;
const diagschetb = db.diagnosis_scheme;
const bodysiteTb = db.body_site;
const bodysideTb = db.body_side;

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
        const searchValue = req.body;
        if (user_uuid && searchValue) {
            try {
                let pageNo = 0;
                const itemsPerPage = searchValue.paginationSize ? searchValue.paginationSize : 10;
                if (searchValue.pageNo) {
                    let temp = parseInt(searchValue.pageNo);
                    if (temp && (temp != NaN)) {
                        pageNo = temp;
                    }
                }
                const offset = pageNo * itemsPerPage;
                const diagnosisData = await diagnosisTbl.findAll({
                    where: getDiagnosisFilterByQuery("filterbythree", searchValue.search),
                    attributes: getDiagnosisAttributes().splice(0, 3),
                    offset: offset,
                    limit: itemsPerPage
                });
                if (diagnosisData) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: "Fetched Diagnosis Data Successfully",
                        responseContents: diagnosisData,

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

        if (user_uuid && diagnosisData) {

            diagnosisTbl.findAll({
                where: {
                    [Op.or]: [{
                        code: diagnosisData.code
                    },
                    {
                        name: diagnosisData.name
                    }
                    ]
                }
            }).then(async (result) => {
                if (result.length != 0) {
                    return res.send({
                        code: 400,
                        status: "error",
                        msg: "Record already Found. Please enter New diagnosis "
                    });
                }
            });

            diagnosisData.code = diagnosisData.code;
            diagnosisData.name = diagnosisData.name;

            diagnosisData.description = diagnosisData & diagnosisData.description ? diagnosisData.description : diagnosisData.name;
            diagnosisData.is_active = diagnosisData.status = emr_const.IS_ACTIVE;
            diagnosisData.created_by = diagnosisData.modified_by = user_uuid;
            diagnosisData.created_date = diagnosisData.modified_date = new Date();
            diagnosisData.revision = 1;
            try {
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

    };
    const _getDiagnosis = async (req, res, next) => {

        let getsearch = req.body;

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
            attributes: getDiagnosisAttributes(),
            include: [
                {
                    model: diagverTb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: diaggradeTb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: bodysideTb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: bodysiteTb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: diagregionTb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: positionsTb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: diagcatTb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: diagschetb,
                    attributes: ['uuid', 'name'],
                    required: false
                },
                {
                    model: diagtypetb,
                    attributes: ['uuid', 'name'],
                    required: false
                }
            ]
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

        if (getsearch.searchKeyWord && /\S/.test(getsearch.searchKeyWord)) {
            findQuery.where = {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis.code')), 'LIKE', '%' + searchData.searchKeyWord.toLowerCase() + '%'),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis.name')), 'LIKE', '%' + searchData.searchKeyWord.toLowerCase() + '%'),


                ]
            };
        }

        if (getsearch.diagnosis_version_uuid && /\S/.test(getsearch.diagnosis_version_uuid)) {
            findQuery.where = {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('diagnosis.diagnosis_version_uuid')), getsearch.diagnosis_version_uuid),
                ]
            };
        }
        if (getsearch.is_active == 1) {
            findQuery.where = { [Op.and]: [{ is_active: 1 }, { status: 1 }] };
        }
        else if (getsearch.is_active == 0) {
            findQuery.where = { [Op.and]: [{ is_active: 0 }, { status: 0 }] };
        }
        else {
            findQuery.where = { [Op.and]: [{ is_active: 1 }, { status: 1 }] };
        }
        try {
            const data = await diagnosisTbl.findAndCountAll(findQuery);

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
            Diagnosis_id
        } = req.body;
        const {
            user_uuid
        } = req.headers;

        if (Diagnosis_id) {
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
                                uuid: Diagnosis_id
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
    const _getDaignosisById = async (req, res, next) => {
        const postData = req.body;

        try {

            const page = postData.page ? postData.page : 1;
            const itemsPerPage = postData.limit ? postData.limit : 10;
            const offset = (page - 1) * itemsPerPage;
           const data = await diagnosisTbl.findOne({
                where: {
                    uuid: postData.Diagnosis_id,
                },
                attributes: getDiagnosisAttributes(),
                offset: offset,
                limit: itemsPerPage,
                include: [
                    {
                        model: diagverTb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: diaggradeTb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: bodysideTb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: bodysiteTb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: diagregionTb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: positionsTb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: diagcatTb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: diagschetb,
                        attributes: ['uuid', 'name'],
                        required: false
                    },
                    {
                        model: diagtypetb,
                        attributes: ['uuid', 'name'],
                        required: false
                    }
                ]
            });
                if (data) {
                const getcuDetails = await getuserDetails(user_uuid, data.created_by, req.headers.authorization);
                const getmuDetails = await getuserDetails(user_uuid, data.modified_by, req.headers.authorization);
                const getdep = await getdepDetails(user_uuid, data.department_uuid, req.headers.authorization);
                const getdata = getfulldata(data, getcuDetails, getmuDetails, getdep);
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

    const _getdiagnosisAutoSearch = async (req, res) => {
        const { user_uuid } = req.headers;
        const { searchValue } = req.body;
        const isValidSearchVal = searchValue && emr_utilites.isStringValid(searchValue);
        if (searchValue && isValidSearchVal && user_uuid) {
            try {
                const diagnosisAutoSearchData = await diagnosisTbl.findAll({
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
        getDaignosisById: _getDaignosisById

    };
};


module.exports = diagnosisController();

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
        "code": data.code,
        "name": data.name,
        "department_uuid": data.department_uuid,
        "department_name": getdep.responseContent.name,
        "description": data.description,
        "sketch_name": data.sketch_name,
        "status": data.status,
        "revision": data.revision,
        "is_active": data.is_active,
        "created_by_id": data.created_by,
        "created_by": getcuDetails.responseContents.title.name + " " + getcuDetails.responseContents.first_name,
        "modified_by_id": data.modified_by,
        "modified_by": getmuDetails.responseContents.title.name + " " + getmuDetails.responseContents.first_name,
        "created_date": data.created_date,
        "modified_date": data.modified_date,
        "speciality_sketch_detail": data.speciality_sketch_detail
    };
    return newdata;
}