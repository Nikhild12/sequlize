const httpStatus = require("http-status");
const db = require("../config/sequelize");
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
const emr_const = require('../config/constants');
const diagnosisTbl = db.diagnosis;
const diagnosisversionTb = db.diagnosis_version;

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

                if (diagnosisData) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: "Fetched Diagnosis Data Successfully",
                        responseContents: diagnosisData ? diagnosisData : []
                    });
                }
            } catch (error) {
                console.log(error.message);
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
        const {
            searchValue
        } = req.body;


        if (user_uuid && searchValue) {

            try {
                const page = searchValue.page ? searchValue.page : 1;
                const itemsPerPage = searchValue.limit ? searchValue.limit : 50;
                const offset = (page - 1) * itemsPerPage;
                const diagnosisData = await diagnosisTbl.findAll({
                    where: getDiagnosisFilterByQuery("filterbythree", searchValue),
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
                console.log(error.message);
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
                        status: "error",
                        msg: "Record already Found. Please enter New diagnosis "
                    });
                }
            });

            diagnosisData.code = diagnosisData & diagnosisData.code ? diagnosisData.code : diagnosisData.name;
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
                console.log(ex.message);
                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: ex.message
                });
            }
        } else {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: 'No Headers Found'
            });
        }

    };
    const _getDiagnosis = async (req, res, next) => {

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
            where: {
               status:1
            },
            attributes: getDiagnosisAttributes(),

            include: [{
                model: diagnosisversionTb,
                attributes: ['uuid', 'code', 'name']
            }]

        };
        console.log("findQuery...............",findQuery)
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
            await diagnosisTbl.findAndCountAll(findQuery)


                .then((findData) => {
                    console.log('\n err...success elseeeeeeeeeee', err)
                    return res
                    console.log('\n err...success else', err)
                        .status(httpStatus.OK)
                        .json({
                            message: "success",
                            statusCode: 200,
                            responseContents: (findData.rows ? findData.rows : []),
                            totalRecords: (findData.count ? findData.count : 0),

                        });
                })
                .catch(err => {
                    console.log('\n err...success else', err);

                    return res
                    console.log('\n err...success elseeeeeeeeeeee', err)
                        .status(httpStatus.OK)
                        .json({
                            message: "error",
                            err: err,
                             req: ''
                        });
                });
        } catch (err) {
            console.log('\n catch err...INTERNAL_SERVER_ERROR', err);
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    message: "error",
                });
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
            await diagnosisTbl.findOne({
                    where: {
                        uuid: postData.Diagnosis_id,

                    },
                    attributes: getDiagnosisAttributes(),
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
        getDiagnosisFilter: _getDiagnosisFilter,
        createDiagnosis: _createDiagnosis,
        getDiagnosisSearch: _getDiagnosisSearch,
        getDiagnosis: _getDiagnosis,
        deleteDiagnosis: _deleteDiagnosis,
        updateDiagnosisById: _updateDiagnosisById,
        getDaignosisById: _getDaignosisById

    };
};


module.exports = diagnosisController();