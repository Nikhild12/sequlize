//Package Import
const httpStatus = require("http-status");
//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//EMR Constants Import
const emr_constants = require('../config/constants');
const emr_utility = require('../services/utility.service');

// Patient notes
const patNotesAtt = require('../attributes/patient_previous_notes_attributes');
const sectionCategoryEntriesTbl = db.section_category_entries;
const profilesTbl = db.profiles;
const conceptsTbl = db.concepts;
const profileSectionsTbl = db.profile_sections;
const profileSectionCategoriesTbl = db.profile_section_categories;
const profileSectionCategoryConceptsTbl = db.profile_section_category_concepts;
const profileSectionCategoryConceptValuesTbl = db.profile_section_category_concept_values;
const sectionsTbl = db.sections;
const categoriesTbl = db.categories;
const profilesTypesTbl = db.profile_types;
const appMasterData = require("../controllers/appMasterData");
const notesController = () => {

    /**
     * OPNotes main template save
     * @param {*} req 
     * @param {*} res 
     */
    const _addProfiles = async (req, res) => {

        const {
            user_uuid
        } = req.headers;
        let profiles = req.body;

        if (user_uuid) {
            profiles.forEach(e => {
                e.is_active = e.status = true;
                e.created_by = e.modified_by = user_uuid;
                e.created_date = e.modified_date = new Date();
                e.revision = 1;
            });

            try {
                const updateData = await sectionCategoryEntriesTbl.update({
                    is_latest: emr_constants.IS_IN_ACTIVE
                }, {
                    where: {
                        is_latest: emr_constants.IS_ACTIVE
                    }
                });
                const profileData = await sectionCategoryEntriesTbl.bulkCreate(profiles, {
                    returing: true
                });
                return res.status(200).send({
                    code: httpStatus.OK,
                    message: 'inserted successfully',
                    reqContents: req.body
                });

            } catch (ex) {
                console.log('Exception happened', ex);
                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: ex
                });
            }
        } else {
            return res.status(400).send({
                code: httpStatus.UNAUTHORIZED,
                message: emr_constants.NO_USER_ID
            });
        }

    };

    const _getPreviousPatientOPNotes = async (req, res) => {
        const {
            user_uuid
        } = req.headers;
        const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
        const {
            patient_uuid
        } = req.query;
        const {
            profile_type_uuid
        } = req.query;

        let filterQuery = {
            patient_uuid: patient_uuid,
            profile_type_uuid: profile_type_uuid,
            status: emr_constants.IS_ACTIVE,
            is_active: emr_constants.IS_ACTIVE
        };
        if (user_uuid && patient_uuid > 0) {
            try {
                const getOPNotesByPId = await getPrevNotes(filterQuery, Sequelize);

                if (getOPNotesByPId != null && getOPNotesByPId.length > 0) {

                    /**Get department name */
                    let departmentIds = [...new Set(getOPNotesByPId.map(e => e.profile.department_uuid))];
                    const departmentsResponse = await appMasterData.getDepartments(user_uuid, Authorization, departmentIds);
                    if (departmentsResponse) {
                        let data = [];
                        const resData = departmentsResponse.responseContent.rows;
                        resData.forEach(e => {
                            data[e.uuid] = e.name;
                            data[e.name] = e.code;
                        });
                        getOPNotesByPId.forEach(e => {
                            const department_uuid = e.dataValues.profile.dataValues.department_uuid;
                            e.dataValues.department_name = (data[department_uuid] ? data[department_uuid] : null);
                        });
                    }
                    /**Get user name */
                    /**Fetching user details from app master API */
                    let doctorIds = [...new Set(getOPNotesByPId.map(e => e.created_by))];
                    const doctorResponse = await appMasterData.getDoctorDetails(user_uuid, Authorization, doctorIds);
                    if (doctorResponse && doctorResponse.responseContents) {
                        let newData = [];
                        const resData = doctorResponse.responseContents;
                        resData.forEach(e => {
                            let last_name = (e.last_name ? e.last_name : '');
                            newData[e.uuid] = e.first_name + '' + last_name;
                        });
                        getOPNotesByPId.forEach(e => {
                            const {
                                created_by,
                            } = e.dataValues;
                            e.dataValues.created_user_name = (newData[created_by] ? newData[created_by] : null);
                        });
                    }
                    // Code and Message for Response
                    const code = emr_utility.getResponseCodeForSuccessRequest(getOPNotesByPId);
                    const message = emr_utility.getResponseMessageForSuccessRequest(code, 'ppnd');
                    // const notesResponse = patNotesAtt.getPreviousPatientOPNotes(getOPNotesByPId);
                    return res.status(200).send({
                        code: code,
                        message,
                        responseContents: getOPNotesByPId
                    });
                } else {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: 'No Data Found'
                    });
                }

            } catch (ex) {
                console.log(`Exception Happened ${ex}`);
                return res.status(400).send({
                    code: httpStatus[400],
                    message: ex.message
                });

            }
        } else {
            return res.status(400).send({
                code: httpStatus[400],
                message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
            });
        }
    };

    const _getOPNotesDetailsById = async (req, res) => {

        const {
            uuid
        } = req.query;
        const {
            user_uuid
        } = req.headers;

        try {
            if (user_uuid && uuid) {
                const notesData = await sectionCategoryEntriesTbl.findOne({
                    where: {
                        uuid: uuid
                    }
                }, {
                    returning: true
                });
                if (!notesData) {
                    return res.status(404).send({
                        code: 404,
                        message: emr_constants.NO_RECORD_FOUND
                    });
                }
                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: notesData
                });
            } else {
                return res.status(400).send({
                    code: httpStatus.UNAUTHORIZED,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
                });
            }
        } catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };

    const _getOPNotesDetailsByPatId = async (req, res) => {

        const {
            patient_uuid
        } = req.query;
        const {
            user_uuid
        } = req.headers;

        try {
            if (user_uuid && patient_uuid) {
                const patNotesData = await sectionCategoryEntriesTbl.findAll({
                    where: {
                        patient_uuid: patient_uuid
                    }
                }, {
                    returning: true
                });
                if (!patNotesData) {
                    return res.status(404).send({
                        code: 404,
                        message: emr_constants.NO_RECORD_FOUND
                    });
                }
                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: patNotesData
                });
            } else {
                return res.status(400).send({
                    code: httpStatus.UNAUTHORIZED,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
                });
            }
        } catch (ex) {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };

    const _updatePreviousPatientOPNotes = async (req, res) => {
        const {
            user_uuid
        } = req.headers;
        let postData = req.body;
        const updateData = postData.map(v => ({
            ...v,
            modified_by: user_uuid,
            modified_date: new Date()
        }));
        try {
            if (user_uuid && updateData) {
                const data = await sectionCategoryEntriesTbl.bulkCreate(updateData, {
                    updateOnDuplicate: ["patient_uuid", "encounter_uuid", "encounter_doctor_uuid", "consultation_uuid", "profile_type_uuid", "profile_uuid", "section_uuid", "section_key", "activity_uuid", "profile_section_uuid", "category_uuid", "category_key", "profile_section_category_uuid", "concept_uuid", "concept_key", "profile_section_category_concept_uuid", "term_key", "profile_section_category_concept_value_uuid", "result_value", "result_value_rich_text", "result_value_json", "result_binary", "result_path", "entry_date", "comments", "entry_status"]
                }, {
                    returing: true
                });
                if (data) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: 'Updated Successfully',
                        requestContent: data
                    });
                }
            } else {
                return res.status(400).send({
                    code: httpStatus.UNAUTHORIZED,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM}  ${emr_constants.FOUND}`
                });

            }
        } catch (ex) {
            console.log('Exception happened', ex);
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex.message
            });

        }
    };
    const _getReviewNotes = async (req, res) => {
        const {
            patient_uuid
        } = req.query;
        const {
            user_uuid
        } = req.headers;
        let findQuery = {
            include: [{
                    model: profilesTbl,
                    required: false
                },
                {
                    model: conceptsTbl,
                    required: false
                },
                {
                    model: categoriesTbl,
                    required: false
                },
                {
                    model: profilesTypesTbl,
                    required: false
                },
                {
                    model: sectionsTbl,
                    required: false
                },
                {
                    model: profileSectionsTbl,
                    required: false
                },
                {
                    model: profileSectionCategoriesTbl,
                    required: false
                },
                {
                    model: profileSectionCategoryConceptsTbl,
                    required: false
                },
                {
                    model: profileSectionCategoryConceptValuesTbl,
                    required: false
                }
            ],
            where: {
                patient_uuid: patient_uuid,
                is_latest: emr_constants.IS_ACTIVE
            }
        };
        try {
            if (user_uuid && patient_uuid) {
                const patNotesData = await sectionCategoryEntriesTbl.findAll(findQuery);
                if (!patNotesData) {
                    return res.status(404).send({
                        code: 404,
                        message: emr_constants.NO_RECORD_FOUND
                    });
                }
                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: patNotesData
                });
            } else {
                return res.status(400).send({
                    code: httpStatus.UNAUTHORIZED,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
                });
            }
        } catch (ex) {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };
    const _print_previous_opnotes = async (req, res) => {
        try {
            const {
                certificate_uuid
            } = req.query;
            const {
                user_uuid
            } = req.headers;

            let certificate_result = {};
            if (certificate_uuid && user_uuid) {
                const result = await patientCertificatesTbl.findOne({
                    where: {
                        uuid: certificate_uuid,
                        status: 1,
                    },
                    attributes: ['uuid', 'patient_uuid', 'facility_uuid', 'department_uuid', 'data_template'],

                });
                if (result && result != null) {
                    certificate_result = {
                        ...result
                    };
                    if (certificate_result) {
                        const pdfBuffer = await printService.createPdf(printService.renderTemplate((__dirname + "/../assets/templates/patient_certificate.html"), {
                            data_template: certificate_result.dataValues.data_template,
                            // language: req.__('dischargeSummary')
                        }), {
                            "format": "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                            // "orientation": "landscape",
                            "width": "18in",
                            "height": "15in",
                            "header": {
                                "height": "5mm"
                            },
                            "footer": {
                                "height": "5mm"
                            }
                        });
                        if (pdfBuffer) {
                            res.writeHead(200, {
                                'Content-Type': 'application/pdf',
                                'Content-disposition': 'attachment;filename=previous_discharge_summary.pdf',
                                'Content-Length': pdfBuffer.length
                            });
                            res.end(Buffer.from(pdfBuffer, 'binary'));
                            return;
                        } else {
                            return res.status(400).send({
                                status: "failed",
                                statusCode: httpStatus[500],
                                message: ND_constats.WENT_WRONG
                            });
                        }
                    } else {
                        return res.status(400).send({
                            status: "failed",
                            statusCode: httpStatus[400],
                            message: ND_constats.WENT_WRONG
                        });
                    }
                } else {
                    return res.status(400).send({
                        status: "failed",
                        statusCode: httpStatus.OK,
                        message: "No Records Found"
                    });
                }
            } else {
                return res.status(422).send({
                    status: "failed",
                    statusCode: httpStatus[422],
                    message: "you are missing certificate_uuid / user_uuid "
                });
            }

        } catch (ex) {
            return res.status(500).send({
                status: "failed",
                statusCode: httpStatus.BAD_REQUEST,
                message: ex.message
            });
        }
    };

    return {
        addProfiles: _addProfiles,
        getPreviousPatientOPNotes: _getPreviousPatientOPNotes,
        getOPNotesDetailsById: _getOPNotesDetailsById,
        getOPNotesDetailsByPatId: _getOPNotesDetailsByPatId,
        updatePreviousPatientOPNotes: _updatePreviousPatientOPNotes,
        getReviewNotes: _getReviewNotes,
        print_previous_opnotes: _print_previous_opnotes
    };
};

module.exports = notesController();


async function getPrevNotes(filterQuery, Sequelize) {
    let sortField = 'created_date';
    let sortOrder = 'DESC';
    let sortArr = [sortField, sortOrder];
    return sectionCategoryEntriesTbl.findAll({
        where: filterQuery,
        group: ['profile_uuid'],
        attributes: ['uuid', 'patient_uuid', 'encounter_uuid', 'encounter_type_uuid', 'encounter_doctor_uuid', 'consultation_uuid', 'profile_uuid', 'entry_status', 'is_active', 'status', 'created_date', 'modified_by', 'created_by', 'modified_date',
            [Sequelize.fn('COUNT', Sequelize.col('profile_uuid')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('profile_uuid')), 'DESC']],
        order: [sortArr],
        limit: 10,
        include: [{
            model: profilesTbl,
            attributes: ['uuid', 'profile_code', 'profile_name', 'profile_type_uuid', 'profile_description', 'facility_uuid', 'department_uuid', 'created_date']
        }],
    });

}