//Package Import
const httpStatus = require("http-status");
//Sequelizer Import
const db = require('../config/sequelize');
const Sequelize = require('sequelize');
const moment = require("moment");

const Op = Sequelize.Op;
//EMR Constants Import
const printService = require('../services/print.service');
const emr_constants = require('../config/constants');
const config = require('../config/config');
const emr_utility = require('../services/utility.service');
const rp = require("request-promise");
const serviceRequest = require('../services/utility.service');
// Patient notes
const patNotesAtt = require('../attributes/patient_previous_notes_attributes');
const sectionCategoryEntriesTbl = db.section_category_entries;
const vw_patientVitalsTbl = db.vw_patient_vitals;
const vw_my_patient_listTbl = db.vw_my_patient_list;
const vw_patient_doctor_detailsTbl = db.vw_patient_doctor_details;
const vw_patientCheifTbl = db.vw_patient_cheif_complaints;
const patient_diagnosisTbl = db.patient_diagnosis;
const diagnosisTbl = db.diagnosis;
const consultationsTbl = db.consultations;
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
const {
    object
} = require("joi");
const {
    includes
} = require("lodash");
const consultations = require("../models/consultations");
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
        let consultation_header = req.body.header;
        let profiles = req.body.details;
        let currentDate = new Date();
        if (user_uuid) {
            try {
                const consultationOutput = await consultationsTbl.create(consultation_header);
                if (!consultationOutput) {
                    throw {
                        error_type: 'validation',
                        errors: "consultation data not inserted"
                    };
                }
                await sectionCategoryEntriesTbl.update({
                    is_latest: emr_constants.IS_IN_ACTIVE
                }, {
                    where: {
                        is_latest: emr_constants.IS_ACTIVE
                    }
                });
                profiles.forEach(e => {
                    e.is_active = e.status = true;
                    e.created_by = e.modified_by = user_uuid;
                    e.created_date = e.modified_date = e.entry_date = currentDate;
                    e.revision = emr_constants.IS_ACTIVE;
                    e.consultation_uuid = consultationOutput.dataValues.uuid;
                });
                await sectionCategoryEntriesTbl.bulkCreate(profiles, {
                    returing: true
                });
                return res.status(200).send({
                    code: httpStatus.OK,
                    message: 'inserted successfully',
                    reqContents: req.body,
                    responseContents : consultationOutput
                });
            } catch (err) {
                if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
                    return res.status(400).json({ Error: err.errors, msg: "Validation error" });
                }
                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: err
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
            patient_uuid,
            profile_type_uuid
        } = req.query;

        let filterQuery = {
            patient_uuid: patient_uuid,
            profile_type_uuid: profile_type_uuid,
            status: emr_constants.IS_ACTIVE,
            // entry_status: emr_constants.ENTRY_STATUS,
            entry_status: {
                [Op.in]: [emr_constants.IS_ACTIVE, emr_constants.ENTRY_STATUS]
            },
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
            user_uuid,
            facility_uuid
        } = req.headers;
        const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
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
                let finalData = [];
                for (let e of patNotesData) {
                    let data;
                    if (e.activity_uuid) {
                        const actCode = await getActivityCode(e.activity_uuid, user_uuid, Authorization);
                        if (actCode) {
                            e.temp = [];
                            e.user_uuid = user_uuid;
                            e.Authorization = Authorization;
                            e.facility_uuid = facility_uuid;
                            data = await getWidgetData(actCode, e);
                            finalData.push(data);
                            console.log(finalData);
                        }
                    } else {
                        finalData.push(e);
                    }
                }
                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: finalData
                });
            } else {
                return res.status(400).send({
                    code: httpStatus.UNAUTHORIZED,
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.FOUND} ${emr_constants.NO} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
                });
            }
        } catch (ex) {
            console.log(ex);
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };
    const _print_previous_opnotes = async (req, res) => {
        try {
            const {
                patient_uuid
            } = req.query;
            const {
                user_uuid,
                facility_uuid
            } = req.headers;
            const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
            let findQuery = {
                include: [
                    {
                        model: consultationsTbl,
                        required: false,
                        include:[
                            {
                                model: vw_my_patient_listTbl,
                                required: false,
                                attributes: {
                                    "exclude": ['id', 'createdAt', 'updatedAt']
                                }
                            },
                            {
                                model: vw_patient_doctor_detailsTbl,
                                required: false,
                                attributes: {
                                    "exclude": ['id', 'createdAt', 'updatedAt']
                                },
                                where: {
                                    department_uuid: {
                                        [Op.col]: 'consultations.department_uuid'
                                    }
                                },
                            },
                        ]
                    },
                    {
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
            if (user_uuid && patient_uuid) {
                let printObj = {};
                const patNotesData = await sectionCategoryEntriesTbl.findAll(findQuery);
                if (!patNotesData) {
                    return res.status(404).send({
                        code: 404,
                        message: emr_constants.NO_RECORD_FOUND
                    });
                }
                let finalData = [];
                let labArr = radArr = invArr = vitArr = cheifArr = presArr = bbArr = diaArr = [];
                let sample = [];

                for (let e of patNotesData) {
                    let data;
                    if (e.activity_uuid) {
                        const actCode = await getActivityCode(e.activity_uuid, user_uuid, Authorization);
                        if (actCode) {
                            printObj[actCode.replace(/\s/g, '')] = true;
                            e.temp = [];
                            e.user_uuid = user_uuid;
                            e.Authorization = Authorization;
                            e.facility_uuid = facility_uuid;
                            data = await getWidgetData(actCode, e);
                            finalData.push(data);
                            console.log(finalData);
                        }
                    } else {
                        finalData.push(e);
                    }
                }

                if (printObj.Lab || printObj.Radiology || printObj.Invenstigation) {
                    finalData.forEach(e => {
                        if (e.activity_uuid == 42) {
                            if (e.dataValues.details[0].pod_arr_result && e.dataValues.details[0].pod_arr_result.length > 0) {

                                labArr = [...labArr, ...e.dataValues.details[0].pod_arr_result];

                            }
                        }
                        if (e.activity_uuid == 43) {
                            if (e.dataValues.details[0].pod_arr_result && e.dataValues.details[0].pod_arr_result.length > 0) {
                                radArr = [...radArr, ...e.dataValues.details[0].pod_arr_result];
                            }
                        }
                        if (e.activity_uuid == 58) {
                            if (e.dataValues.details[0].pod_arr_result && e.dataValues.details[0].pod_arr_result.length > 0) {
                                invArr = [...invArr, ...e.dataValues.details[0].pod_arr_result];
                            }
                        }
                    });
                }
                if (printObj.Vitals) {
                    finalData.forEach(e => {
                        if (e.activity_uuid == 57) {
                            vitArr = [...vitArr, ...e.dataValues.details];
                            // vitArr.push(e.dataValues.details);
                        }
                    });
                }
                if (printObj.ChiefComplaints) {
                    finalData.forEach(e => {
                        if (e.activity_uuid == 49) {
                            cheifArr = [...cheifArr, ...e.dataValues.details];
                        }
                    });
                }
                if (printObj.Diagnosis) {
                    finalData.forEach(e => {
                        if (e.activity_uuid == 59) {
                            diaArr = [...diaArr, ...e.dataValues.details];
                        }
                    });
                }
                if (printObj.Prescriptions) {
                    finalData.forEach(e => {
                        if (e.activity_uuid == 44) {
                            if (e.dataValues.details[0].prescription_details && e.dataValues.details[0].prescription_details.length > 0) {
                                e.dataValues.details[0].prescription_details.forEach(i => {
                                    i.store_master = e.dataValues.details[0].store_master;
                                    i.has_e_mar = e.dataValues.details[0].has_e_mar;
                                });
                                presArr = [...presArr, ...e.dataValues.details[0].prescription_details];
                            }
                        }
                    });
                }
                if (printObj.BloodRequests) {
                    finalData.forEach(e => {
                        if (e.dataValues.activity_uuid == 252) {
                            if (e.dataValues.details) {
                                let detailsArr = e.dataValues.details[0].blood_request_details.map(i => {
                                    return {
                                        blood_request_status: e.dataValues.details[0].blood_request_status.name,
                                        blood_group: e.dataValues.details[0].blood_group.name,
                                        blood_hb: e.dataValues.details[0].blood_hb,
                                        a: i.blood_component.name
                                    };
                                });
                                bbArr = [...bbArr, ...detailsArr];
                            }
                        }
                    });
                }
                let patientObj = {
                    patient_name : finalData[0].consultations.vw_my_patient_list.pa_first_name,
                    age: finalData[0].consultations.vw_my_patient_list.pa_age,
                    title: finalData[0].consultations.vw_my_patient_list.t_name,
                    mobile: finalData[0].consultations.vw_my_patient_list.pd_mobile,
                    pin: finalData[0].consultations.vw_my_patient_list.pa_pin
                };
                let doctorObj = {
                    doctor_name : finalData[0].consultations.vw_patient_doctor_details.u_first_name,
                    dept_name: finalData[0].consultations.vw_patient_doctor_details.d_name,
                    title: finalData[0].consultations.vw_patient_doctor_details.t_name,
                    date: finalData[0].consultations.created_date,
                    notes_name: finalData[0].profiles.name
                };
                // let uniqueChars = [...new Set(sample)];
                printObj.patientDetails = patientObj;
                printObj.doctorDetails = doctorObj;
                printObj.labResult = labArr;
                printObj.radResult = radArr;
                printObj.invResult = invArr;
                printObj.vitResult = vitArr;
                printObj.cheifResult = cheifArr;
                printObj.presResult = presArr;
                printObj.bbResult = bbArr;
                printObj.diaResult = diaArr;

                printObj.details = finalData;
                
                console.log(patObj);
                // printObj.basicDetails = 
                for (let e of finalData) {
                    let sampleObj = {
                        [e.profile_section_category_concept.name]: e.profile_section_category_concept_value.value_name ? e.profile_section_category_concept_value.value_name : e.term_key
                    };
                    if (sample.length == 0) {
                        sample.push(sampleObj);
                    } else {
                        let check = sample.find(item => {
                            console.log(item);
                            return Object.keys(item)[0] == e.profile_section_category_concept.name;
                        });
                        if (check) {
                            var value = Object.values(check).toString() + ',' + e.profile_section_category_concept_value.value_name ? e.profile_section_category_concept_value.value_name : e.term_key;
                            check[e.profile_section_category_concept.name] = value;
                            sample.push(check);
                        } else {
                            sample.push(sampleObj);
                        }
                    }
                }

                printObj.sectionResult = [...new Set(sample)];

                if (finalData && finalData.length > 0) {
                    printObj.sectionName = finalData[0].section ? finalData[0].section.name : '';
                    printObj.categoryName = finalData[0].category ? finalData[0].category.name : '';
                }
                printObj.printedOn = moment().utcOffset("+05:30").format('DD-MMM-YYYY HH:mm a');
                const facility_result = await getFacilityDetails(req);
                // console.log("facility_result::",facility_result);
                if (facility_result.status) {
                    let {
                        status: data_facility_status,
                        facility_uuid: data_facility_uuid,
                        facility
                    } = facility_result.data;

                    let {
                        facility_printer_setting: facPrSet
                    } = facility;
                    // console.log("facilityPrinterSetting::",facPrSet);

                    let isFaciltySame = (facility_uuid == data_facility_uuid);
                    printObj.header1 = (isFaciltySame ? (facPrSet ? facPrSet.pharmacy_print_header1 : facPrSet.printer_header1) : '');
                    printObj.header2 = (isFaciltySame ? (facPrSet ? facPrSet.pharmacy_print_header2 : facPrSet.printer_header2) : '');
                    printObj.footer1 = (isFaciltySame ? (facPrSet ? facPrSet.pharmacy_print_footer1 : facPrSet.printer_footer1) : '');
                    printObj.footer2 = (isFaciltySame ? (facPrSet ? facPrSet.pharmacy_print_footer2 : facPrSet.printer_footer2) : '');
                }


                return res.status(200).send({
                    code: httpStatus.OK,
                    responseContent: printObj
                });
                const pdfBuffer = await printService.createPdf(printService.renderTemplate((__dirname + "/../assets/templates/reviewNotes.html"), {
                    headerObj: printObj
                }), {
                    format: 'A4',
                    header: {
                        height: '45mm'
                    },
                    footer: {
                        height: '20mm',
                        contents: {
                            default: '<div style="color: #444;text-align: right;font-size: 10px;padding-right:0.5in;">Page Number: <span>{{page}}</span>/<span>{{pages}}</span></div>'
                        }
                    },
                });
                if (pdfBuffer) {
                    res.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-disposition': 'attachment;filename=op_notes.pdf',
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
                return res.status(422).send({
                    status: "failed",
                    statusCode: httpStatus[422],
                    message: "you are missing patient_uuid / user_uuid "
                });
            }

        } catch (ex) {
            console.log(ex);
            return res.status(500).send({
                status: "failed",
                statusCode: httpStatus.BAD_REQUEST,
                message: ex.message
            });
        }
    };
    const _addConsultations = async (req, res) => {

        const {
            user_uuid
        } = req.headers;
        let postData = req.body;

        if (user_uuid) {
            postData.is_active = postData.status = true;
            postData.created_by = postData.modified_by = user_uuid;
            postData.created_date = postData.modified_date = new Date();
            postData.revision = 1;

            try {

                const consultationsData = await consultationsTbl.create(postData, {
                    returing: true
                });
                if (consultationsData) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: 'Inserted successfully',
                        reqContents: req.body,
                        responseContents: consultationsData
                    });
                } else {
                    return res.status(400).send({
                        code: httpStatus.OK,
                        message: 'Failed to insert',
                        reqContents: req.body,
                        responseContents: consultationsData
                    });
                }


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
    const _updateConsultations = async (req, res) => {
        const {
            user_uuid
        } = req.headers;
        let postData = req.body;
        if (user_uuid) {
            postData.is_active = postData.status = true;
            postData.modified_by = user_uuid;
            postData.modified_date = new Date();
            postData.revision = emr_constants.IS_ACTIVE;
            try {
                const consultationsData = await consultationsTbl.update(postData, {
                    returing: true
                });
                if (consultationsData) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: 'Update successfully',
                        reqContents: req.body,
                        responseContents: consultationsData
                    });
                } else {
                    return res.status(400).send({
                        code: httpStatus.OK,
                        message: 'Failed to update',
                        reqContents: req.body,
                        responseContents: consultationsData
                    });
                }
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
    function getWidgetData(actCode, result) {
        switch (actCode) {
            case "Lab":
                return getLabResult(result);
            case "Radiology":
                return getRadiologyResult(result);
            case "Prescriptions":
                return getPrescriptionsResult(result);
            case "Investigation":
                return getInvestResult(result);
            case "Vitals":
                return getVitalsResult(result);
            case "Chief Complaints":
                return getChiefComplaintsResult(result);
            case "Blood Requests":
                return getBloodRequestResult(result);
            case "Diagnosis":
                return getDiagnosisResult(result);
            default:
                let templateDetails = result;
                return {
                    templateDetails
                };
        }
    }
    const getActivityCode = async (Id, user_uuid, auth) => {
        console.log('////////////////');
        let options = {
            uri: config.wso2AppUrl + 'activity/getActivityById',
            //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/facility/getFacilityByuuid',
            //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
            method: "POST",
            headers: {
                Authorization: auth,
                user_uuid: user_uuid
            },
            body: {
                "Id": Id
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        console.log(user_details);
        if (user_details && user_details.responseContents)
            return user_details.responseContents.name;
        else
            return false;
    };
    const getLabResult = async (result) => {
        let options = {
            uri: config.wso2LisUrl + 'patientorders/getLatestRecords',
            //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/facility/getFacilityByuuid',
            //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
            method: "POST",
            headers: {
                Authorization: result.Authorization,
                user_uuid: result.user_uuid,
                facility_uuid: result.facility_uuid
            },
            body: {
                "patient_id": result.patient_uuid,
                "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        console.log(options);
        const user_details = await serviceRequest.postRequest(options.uri, options.headers, options.body);
        console.log(user_details);
        if (user_details && user_details) {
            result.dataValues.details = user_details;
            return result;
        } else
            return false;
    };
    const getRadiologyResult = async (result) => {
        let options = {
            uri: config.wso2RmisUrl + 'patientorders/getLatestRecords',
            //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/facility/getFacilityByuuid',
            //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
            method: "POST",
            headers: {
                Authorization: result.Authorization,
                user_uuid: result.user_uuid,
                facility_uuid: result.facility_uuid
            },
            body: {
                "patient_id": result.patient_uuid,
                "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        console.log(user_details);
        if (user_details && user_details.responseContents) {
            result.dataValues.details = user_details.responseContents;
            return result;
        } else
            return false;
    };
    const getInvestResult = async (result) => {
        let options = {
            uri: config.wso2InvestUrl + 'patientorders/getLatestRecords',
            //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/facility/getFacilityByuuid',
            //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
            method: "POST",
            headers: {
                Authorization: result.Authorization,
                user_uuid: result.user_uuid,
                facility_uuid: result.facility_uuid
            },
            body: {
                "patient_id": result.patient_uuid,
                "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        console.log(user_details);
        if (user_details && user_details.responseContents) {
            result.dataValues.details = user_details.responseContents;
            return result;
        } else
            return false;
    };
    const getVitalsResult = async (result) => {
        const user_details = await vw_patientVitalsTbl.findAll({
            where: {
                pv_patient_uuid: result.patient_uuid,
                pv_encounter_uuid: result.encounter_uuid
            },
            limit: 10,
            order: [
                ['pv_created_date', 'DESC']
            ],
            attributes: {
                "exclude": ['id', 'createdAt', 'updatedAt']
            },
        });
        if (user_details) {
            result.dataValues.details = user_details;
            return result;
        } else
            return false;
    };
    const getChiefComplaintsResult = async (result) => {
        const user_details = await vw_patientCheifTbl.findAll({
            limit: 10,
            order: [
                ['pcc_created_date', 'DESC']
            ],
            where: {
                pcc_patient_uuid: result.patient_uuid,
                pcc_encounter_uuid: result.encounter_uuid
            },
            attributes: {
                "exclude": ['id', 'createdAt', 'updatedAt']
            },
        });
        if (user_details) {
            result.dataValues.details = user_details;
            return result;
        } else
            return false;
    };
    const getDiagnosisResult = async (result) => {
        const user_details = await patient_diagnosisTbl.findAll({
            where: {
                patient_uuid: result.patient_uuid,
                encounter_uuid: result.encounter_uuid
            },
            include: [{
                model: diagnosisTbl
            }]
        });
        if (user_details) {
            result.dataValues.details = user_details;
            return result;
        } else
            return false;
    };
    const getPrescriptionsResult = async (result) => {
        let options = {
            uri: config.wso2InvUrl + 'prescriptions/getPrescriptionByPatientId',
            //uri: 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/facility/getFacilityByuuid',
            //uri: "https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/GetAllDoctors",
            method: "POST",
            headers: {
                Authorization: result.Authorization,
                user_uuid: result.user_uuid,
                facility_uuid: result.facility_uuid
            },
            body: {
                "patient_uuid": result.patient_uuid,
                // "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        console.log(options)
        const user_details = await rp(options);
        console.log(user_details);
        if (user_details && user_details.responseContents) {
            result.dataValues.details = user_details.responseContents;
            return result;
        } else
            return false;
    };
    const getBloodRequestResult = async (result) => {
        let options = {
            uri: config.wso2BloodBankUrl + 'bloodRequest/getpreviousbloodRequestbyID',
            method: "POST",
            headers: {
                // Authorization: result.Authorization,
                user_uuid: result.user_uuid,
                facility_uuid: result.facility_uuid
            },
            body: {
                "patient_uuid": result.patient_uuid,
                // "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        console.log(user_details);
        if (user_details && user_details.responseContents) {
            result.dataValues.details = user_details.responseContents;
            return result;
        } else
            return false;
    };
    const getFacilityDetails = async (req) => {
        try {
            const getFacilityUrl = 'facility/getFacilityById';
            const postData = {
                Id: req.headers.facility_uuid
            };

            const res = await getResultsInObject(getFacilityUrl, req, postData);
            console.log('>>>>>>>>>>>>>>>facility_res', res);
            if (res.status && res.data.length > 0) {
                const resData = res.data;
                return {
                    status: true,
                    data: resData
                };
            } else {
                return res;
            }
        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return {
                status: false,
                message: errorMsg
            };
        }
    };
    const getResultsInObject = async (url, req, data) => {
        try {
            const _url = config.wso2AppUrl + url;
            console.log("_url::", _url);
            let options = {
                uri: _url,
                headers: {
                    user_uuid: req.headers.user_uuid,
                    facility_uuid: req.headers.facility_uuid,
                    Authorization: req.headers.authorization
                },
                method: "POST",
                json: true, // Automatically parses the JSON string in the response
                // body : {
                //     uuid : data
                // }

            };

            if (data) {
                options.body = data;
            }

            console.log("options:", options);
            const results = await rp(options);
            console.log("getResultsInObject_ResultData:", results);

            if (results.responseContents) {
                if (results.responseContents.length <= 0) {
                    return {
                        status: false,
                        message: "No content"
                    };
                } else {
                    return {
                        status: true,
                        data: results.responseContents
                    };
                }
            } else if (results.responseContent) {
                if (results.responseContent.length <= 0) {
                    return {
                        status: false,
                        message: "No content"
                    };
                } else {
                    return {
                        status: true,
                        data: results.responseContent
                    };
                }
            }

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return {
                status: false,
                message: errorMsg
            };
        }
    };
    return {
        addProfiles: _addProfiles,
        getPreviousPatientOPNotes: _getPreviousPatientOPNotes,
        getOPNotesDetailsById: _getOPNotesDetailsById,
        getOPNotesDetailsByPatId: _getOPNotesDetailsByPatId,
        updatePreviousPatientOPNotes: _updatePreviousPatientOPNotes,
        getReviewNotes: _getReviewNotes,
        print_previous_opnotes: _print_previous_opnotes,
        addConsultations: _addConsultations,
        updateConsultations: _updateConsultations
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