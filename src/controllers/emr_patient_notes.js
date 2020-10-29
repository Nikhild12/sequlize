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
// Patient notes
const patNotesAtt = require('../attributes/patient_previous_notes_attributes');
const sectionCategoryEntriesTbl = db.section_category_entries;
const vw_patientVitalsTbl = db.vw_patient_vitals;
const vw_consultation_detailsTbl = db.vw_consultation_details;
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
const profileSectionCategoryConceptValueTermsTbl = db.profile_section_category_concept_value_terms;
const conceptValueTermsTbl = db.concept_value_terms;
const sectionsTbl = db.sections;
const categoriesTbl = db.categories;
const profilesTypesTbl = db.profile_types;
const {
    APPMASTER_GET_SCREEN_SETTINGS,
    APPMASTER_UPDATE_SCREEN_SETTINGS
} = emr_constants.DEPENDENCY_URLS;
const {
    BOOLEAN,
    CHECKBOX,
    DROPDOWN,
    TERMBASED,
    RADIO
} = emr_constants.VALUE_TYPES;
const appMasterData = require("../controllers/appMasterData");

const consultations = require("../models/consultations");

const notesController = () => {

    /**
     * OPNotes main template save
     * @param {*} req
     * @param {*} res
     */
    const _addProfiles = async (req, res) => {
        try {
            const {
                user_uuid
            } = req.headers;
            let profiles = req.body;
            let currentDate = new Date();
            if ((!Array.isArray(profiles)) || profiles.length < 1) {
                throw ({
                    error_type: "validation",
                    errors: "Invalid request"
                });
            }
            profiles.forEach(e => {
                if (e.uuid) {
                    e.modified_by = user_uuid;
                    e.modified_date = currentDate;
                } else {
                    e.created_by = user_uuid;
                    e.created_date = currentDate;
                    e.entry_date = currentDate;
                }
            });
            let result_data = [];
            for (let epwod of profiles) {
                let bulkData = await sectionCategoryEntriesTbl.bulkCreate([epwod], {
                    updateOnDuplicate: Object.keys(epwod)
                });
                for (let d of bulkData) {
                    result_data.push(d.dataValues);
                }
            }
            return res.status(200).send({
                code: httpStatus.OK,
                message: 'inserted successfully',
                reqContents: profiles,
                responseContents: result_data
            });
        } catch (err) {
            if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
                return res.status(400).json({
                    msg: "Validation error",
                    Error: err.errors
                });
            }
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: err
            });
        }

    };
    const _getPreviousPatientOPNotes = async (req, res) => {
        try {
            const {
                user_uuid
            } = req.headers;
            const Authorization = req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
            const {
                patient_uuid,
                profile_type_uuid,
                pageNo,
                paginationSize,
                sortField,
                sortOrder
            } = req.query;
            let sortArr = ['created_date', 'DESC'];

            let pageNum = 0;
            const itemsPerPage = paginationSize ? parseInt(paginationSize) : 10;
            if (pageNo) {
                let temp = parseInt(pageNo);
                if (temp && (temp != NaN)) {
                    pageNum = temp;
                }
            }
            const offset = pageNum * itemsPerPage;
            let fieldSplitArr = [];
            if (sortField) {
                fieldSplitArr = sortField.split('.');
                if (fieldSplitArr.length == 1) {
                    sortArr[0] = sortField;
                } else {
                    for (let idx = 0; idx < fieldSplitArr.length; idx++) {
                        const element = fieldSplitArr[idx];
                        fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
                    }
                    sortArr = fieldSplitArr;
                }
            }
            if (sortOrder && ((sortOrder.toLowerCase() == 'asc') || (sortOrder.toLowerCase() == 'desc'))) {
                if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
                    sortArr[1] = sortOrder;
                } else {
                    sortArr.push(sortOrder);
                }
            }
            const getOPNotesByPId = await consultationsTbl.findAndCountAll({
                offset: offset,
                limit: itemsPerPage,
                order: [
                    sortArr
                ],
                where: {
                    patient_uuid: patient_uuid,
                    profile_type_uuid: profile_type_uuid,
                    status: emr_constants.IS_ACTIVE,
                    is_active: emr_constants.IS_ACTIVE,
                    entry_status: {
                        [Op.in]: [emr_constants.IS_ACTIVE, emr_constants.ENTRY_STATUS]
                    }
                },
                attributes: ['uuid', 'patient_uuid', 'encounter_uuid', 'encounter_type_uuid', 'encounter_doctor_uuid', 'profile_uuid', 'entry_status', 'is_active', 'status', 'created_date', 'modified_by', 'created_by', 'modified_date', 'reference_no', ],
                include: [{
                    model: profilesTbl,
                    required: false,
                    attributes: ['uuid', 'profile_code', 'profile_name', 'profile_type_uuid', 'profile_description', 'facility_uuid', 'department_uuid', 'created_date']
                }]
            });
            let rowsData = getOPNotesByPId.rows;
            if (rowsData != null && rowsData.length > 0) {
                /**Get department name */
                let departmentIds = [...new Set(rowsData.map(e => e.profile.department_uuid))];
                const departmentsResponse = await appMasterData.getDepartments(user_uuid, Authorization, departmentIds);
                if (departmentsResponse) {
                    let data = [];
                    const resData = departmentsResponse.responseContent.rows;
                    resData.forEach(e => {
                        data[e.uuid] = e.name;
                        data[e.name] = e.code;
                    });
                    rowsData.forEach(e => {
                        const department_uuid = e.dataValues.profile.dataValues.department_uuid;
                        e.dataValues.department_name = (data[department_uuid] ? data[department_uuid] : null);
                    });
                }
                /**Get user name */
                /**Fetching user details from app master API */
                let doctorIds = [...new Set(rowsData.map(e => e.created_by))];
                const doctorResponse = await appMasterData.getDoctorDetails(user_uuid, Authorization, doctorIds);
                if (doctorResponse && doctorResponse.responseContents) {
                    let newData = [];
                    const resData = doctorResponse.responseContents;
                    resData.forEach(e => {
                        let last_name = (e.last_name ? e.last_name : '');
                        newData[e.uuid] = e.first_name + '' + last_name;
                    });
                    rowsData.forEach(e => {
                        const {
                            created_by,
                        } = e.dataValues;
                        e.dataValues.created_user_name = (newData[created_by] ? newData[created_by] : null);
                    });
                }
                // Code and Message for Response
                const code = emr_utility.getResponseCodeForSuccessRequest(rowsData);
                const message = emr_utility.getResponseMessageForSuccessRequest(code, 'ppnd');
                // const notesResponse = patNotesAtt.getPreviousPatientOPNotes(rowsData);
                return res.status(200).send({
                    code: code,
                    message,
                    responseContents: rowsData,
                    totalRecords: getOPNotesByPId.count
                });
            } else {
                return res.status(200).send({
                    code: httpStatus.OK,
                    message: 'No Data Found'
                });
            }

        } catch (ex) {
            return res.status(400).send({
                code: httpStatus[400],
                message: ex.message
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
        try {
            const {
                patient_uuid,
                consultation_uuid
            } = req.query;
            let findQuery = {
                where: {
                    patient_uuid: patient_uuid
                }
            }
            if (consultation_uuid && /\S/.test(consultation_uuid)) {
                Object.assign(findQuery.where, {
                    consultation_uuid: consultation_uuid
                });
            }
            const patNotesData = await sectionCategoryEntriesTbl.findAndCountAll(findQuery);
            if (patNotesData.count == 0) {
                return res.status(404).send({
                    code: 404,
                    message: emr_constants.NO_RECORD_FOUND
                });
            }
            return res.status(200).send({
                code: httpStatus.OK,
                responseContent: patNotesData.rows,
                totalRecords: patNotesData.count
            });
        } catch (ex) {
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };
    const _updatePreviousPatientOPNotes = async (req, res) => {
        try {
            const {
                user_uuid
            } = req.headers;
            let postData = req.body;
            let currentDate = new Date();
            let result_data = [];
            if (!Array.isArray(postData) || postData.length < 1) {
                throw ({
                    error_type: "validation",
                    errors: "invalid request(send valid payload)"
                });
            }
            let body_id_array = postData.filter(element => {
                return (element.uuid == null || element.uuid == '' || element.uuid <= 0);
            });
            if (body_id_array.length) {
                throw ({
                    error_type: "validation",
                    errors: "uuid need to send"
                });
            }
            let body_array = postData.filter(element => {
                return (element.consultation_uuid == null || element.consultation_uuid == '' || element.consultation_uuid <= 0);
            });
            if (body_array.length) {
                throw ({
                    error_type: "validation",
                    errors: "consultation_uuid should be present and greater than zero"
                });
            }
            for (let epwod of updateData) {
                epwod.modified_by = user_uuid;
                epwod.modified_date = currentDate;
                let bulkData = await sectionCategoryEntriesTbl.bulkCreate([epwod], {
                    updateOnDuplicate: Object.keys(epwod)
                });
                for (let d of bulkData) {
                    result_data.push(d.dataValues);
                }
            }
            if (result_data && result_data.length > 0) {
                let patNotesData = await sectionCategoryEntriesTbl.findAndCountAll({
                    where: {
                        consultation_uuid: postData[0].consultation_uuid,
                    }
                });
                return res.status(200).send({
                    code: httpStatus.OK,
                    message: 'Updated Successfully',
                    responseContents: patNotesData
                });
            }
        } catch (err) {
            if (typeof err.error_type != 'undefined' && err.error_type == 'validation') {
                return res.status(400).json({
                    statusCode: 400,
                    Error: err.errors,
                    msg: "validation error"
                });
            }
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: err.message
            });
        }
    };
    const _getReviewNotes = async (req, res) => {
        try {
            const {
                patient_uuid,
                consultation_uuid
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
                    },
                    {
                        model: profileSectionCategoryConceptValueTermsTbl,
                        required: false,
                        include: [{
                            model: conceptValueTermsTbl,
                            required: false,
                            attributes: ['uuid', 'code', 'name']
                        }]
                    }
                ],
                where: {
                    patient_uuid: patient_uuid,
                    consultation_uuid: consultation_uuid,
                    status: emr_constants.IS_ACTIVE,
                    is_active: emr_constants.IS_ACTIVE
                }
            };
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
                        data = await getWidgetData(actCode, e, consultation_uuid);
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
        } catch (ex) {
            console.log(ex);
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };
    // getfilternotes(value) {
    //     console.log(value, 'va;ue');

    //     if (this.filteredrivewnotes.length === 0 && value.activity_uuid === 0) {
    //     this.filteredrivewnotes.push(value);
    //     } else if (value.activity_uuid !== 0) {
    //     this.filteredrivewnotes.push(value);
    //     } else {
    //     const obj = this.filteredrivewnotes.find((data: any) => {
    //     return data.section_uuid === value.section_uuid;
    //     });
    //     obj ? null : this.filteredrivewnotes.push(value);
    //     }
    //     this.filteredrivewnotes = this.filteredrivewnotes.sort((a, b) => {
    //     return this.emrworkflow.map(headerTabmenuId => headerTabmenuId.activity_id).indexOf(a.activity_uuid) -
    //     this.emrworkflow.map(headerTabmenuId => headerTabmenuId.activity_id).indexOf(b.activity_uuid);
    //     });
    //     // tslint:disable-next-line: max-line-length
    //     this.filteredrivewnotes.sort((a, b) => a.profile_section.display_order < b.profile_section.display_order ? -1 : a.profile_section.display_order > b.profile_section.display_order ? 1 : 0)
    //     console.log(this.filteredrivewnotes, 'this.filteredrivewnotes');

    //     }
    const _print_previous_opnotes = async (req, res) => {
        try {
            const {
                patient_uuid,
                consultation_uuid
            } = req.query;
            const {
                user_uuid,
                facility_uuid
            } = req.headers;
            const Authorization = 'Bearer e222c12c-e0d1-3b8b-acaa-4ca9431250e2';
            // req.headers.Authorization ? req.headers.Authorization : (req.headers.authorization ? req.headers.authorization : 0);
            let findQuery = {
                include: [{
                        model: vw_consultation_detailsTbl,
                        required: false,
                        attributes: {
                            "exclude": ['id', 'createdAt', 'updatedAt']
                        },
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
                    },
                    {
                        model: profileSectionCategoryConceptValueTermsTbl,
                        required: false,
                        include: [{
                            model: conceptValueTermsTbl,
                            required: false,
                            attributes: ['uuid', 'code', 'name']
                        }]
                    }
                ],
                where: {
                    patient_uuid: patient_uuid,
                    consultation_uuid: consultation_uuid,
                    status: emr_constants.IS_ACTIVE,
                    is_active: emr_constants.IS_ACTIVE
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
                const printFlag = true;
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
                            data = await getWidgetData(actCode, e, consultation_uuid, printFlag);
                            finalData.push(data);
                            console.log(finalData);
                        }
                    } else {
                        finalData.push(e);
                    }
                }
                // return res.send(finalData);
                let labCheck = false;
                let radCheck = false;
                let invCheck = false;
                let vitalCheck = false;
                let cheifCheck = false;
                let diaCheck = false;
                let bbCheck = false;
                let presCheck = false;


                if (printObj.Lab || printObj.Radiology || printObj.Invenstigation) {
                    finalData.forEach(e => {
                        if (e && e.dataValues.details) {
                            if (e.activity_uuid == 42 && labCheck == false) {
                                if (e.dataValues.details && e.dataValues.details.length > 0) {
                                    labArr = [...labArr, ...e.dataValues.details];
                                    console.log(labArr);
                                    labCheck = true;
                                }
                            }
                            if (e.activity_uuid == 43 && radCheck == false) {
                                if (e.dataValues.details && e.dataValues.details.length > 0) {
                                    radArr = [...radArr, ...e.dataValues.details];
                                    console.log(radArr)
                                    radCheck = true;
                                }
                            }
                            console.log(e);
                            if (e.activity_uuid == 58 && invCheck == false) {
                                if (e.dataValues.details && e.dataValues.details.length > 0) {
                                    invArr = [...invArr, ...e.dataValues.details];
                                    invCheck = true;
                                }

                            }
                        } else {
                            labArr = labArr;
                            radArr = radArr;
                            invArr = invArr;
                        }
                    });
                }
                if (printObj.Vitals) {
                    finalData.forEach(e => {
                        if (e && e.dataValues.details) {
                            if (e.activity_uuid == 57 && vitalCheck == false) {
                                vitArr = [...vitArr, ...e.dataValues.details];
                                // vitArr.push(e.dataValues.details);
                                vitalCheck = true;
                            }
                        } else {
                            vitArr = vitArr;
                        }
                    });
                }
                if (printObj.ChiefComplaints) {
                    finalData.forEach(e => {
                        if (e && e.dataValues.details) {
                            if (e.activity_uuid == 49 && cheifCheck == false) {
                                cheifArr = [...cheifArr, ...e.dataValues.details];
                                cheifCheck = true;
                            }
                        } else {
                            cheifArr = cheifArr;
                        }

                    });
                }
                // let snomed = [];
                let dia_type = '';
                if (printObj.Diagnosis) {
                    finalData.forEach(e => {
                        if (e && e.dataValues.details) {
                            if (e.activity_uuid == 59 && diaCheck == false) {
                                console.log(e.dataValues.details);
                                e.dataValues.details.forEach(i => {
                                    let data = {
                                        name: i.is_snomed == true ? i.other_diagnosis : i.diagnosis.name,
                                        code: i.is_snomed == true ? i.diagnosis_uuid : i.diagnosis.code,
                                        dia_type: i.is_snomed == true ? 'SNOMED' : 'ICD10'
                                    };
                                    diaArr = [...diaArr, data];
                                });
                                diaCheck = true;

                            }
                        } else {
                            diaArr = diaArr;
                        }

                    });
                }
                if (printObj.Prescriptions) {
                    finalData.forEach(e => {
                        if (e && e.dataValues.details && e.dataValues.details[0] && e.dataValues.details[0].prescription_details) {
                            if (e.activity_uuid == 44 && presCheck == false) {
                                if (e.dataValues.details[0].prescription_details && e.dataValues.details[0].prescription_details.length > 0) {
                                    e.dataValues.details[0].prescription_details.forEach(i => {
                                        console.log('.................', i);
                                        i.store_master = e.dataValues.details[0].injection_room ? e.dataValues.details[0].injection_room : e.dataValues.details[0].store_master;
                                        i.has_e_mar = i.is_emar;
                                    });
                                    presArr = [...presArr, ...e.dataValues.details[0].prescription_details];
                                    console.log(presArr);
                                    presCheck = true;

                                }
                            }
                        } else {
                            presArr = presArr;
                        }
                    });
                }
                if (printObj.BloodRequests) {
                    finalData.forEach(e => {
                        if (e && e.dataValues.details && e.dataValues.details[0].blood_request_details) {
                            if (e.dataValues.activity_uuid == 252 && bbCheck == false) {
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
                                    bbCheck = true;

                                }
                            }
                        } else {
                            bbArr = bbArr;
                        }
                    });
                }
                let patientObj;
                if (finalData && finalData[0] && finalData[0].vw_consultation_detail) {
                    console.log(finalData[0].vw_consultation_detail);
                    patientObj = {
                        patient_name: finalData ? finalData[0].vw_consultation_detail.dataValues.pa_first_name : '',
                        age: finalData ? finalData[0].vw_consultation_detail.dataValues.pa_age : '',
                        period: finalData ? (finalData[0].vw_consultation_detail.dataValues.period_name == 'Year' ? 'Years' : finalData[0].vw_consultation_detail.dataValues.period_name) : '',
                        gender: finalData ? finalData[0].vw_consultation_detail.dataValues.g_name : '',
                        pa_title: finalData ? finalData[0].vw_consultation_detail.dataValues.pt_name : '',
                        mobile: finalData ? finalData[0].vw_consultation_detail.dataValues.p_mobile : '',
                        pin: finalData ? finalData[0].vw_consultation_detail.dataValues.pa_pin : '',
                        doctor_name: finalData ? finalData[0].vw_consultation_detail.dataValues.u_first_name : '',
                        dept_name: finalData ? finalData[0].vw_consultation_detail.dataValues.d_name : '',
                        title: finalData ? finalData[0].vw_consultation_detail.dataValues.t_name : '',
                        date: finalData ? moment(finalData[0].vw_consultation_detail.dataValues.created_date).format('DD-MMM-YYYY hh:mm A') : '',
                        notes_name: finalData ? finalData[0].vw_consultation_detail.dataValues.pr_name : ''
                    };
                } else {
                    patientObj = {};
                }
                printObj.patientDetails = finalData ? patientObj : false;
                printObj.labResult = labArr;
                printObj.radResult = radArr;
                printObj.invResult = invArr;
                printObj.vitResult = vitArr;
                printObj.cheifResult = cheifArr;
                printObj.presResult = presArr;
                printObj.bbResult = bbArr;
                printObj.diaResult = diaArr;

                printObj.details = finalData;
                let checkSectionName = false;
                let checkCategoryName = false;
                printObj.sectionName = '';
                printObj.categoryName = '';
                const sectionObj = [];
                let sectionId;
                let categoryId;
                let concept_uuid = 0;
                for (let e of finalData) {
                    let sampleObj;
                    let {
                        section: eSec,
                        category: eCat,
                        term_key: eTermKey,
                        profile_section_category_concept: profSecCatConcept,
                        profile_section_category_concept_value: profSecCatConVal,
                        profile_section_category_concept_value_term: profSecCatConValTerm,
                        profile_section_category_concept_value_terms_uuid: psccvt_uuid
                    } = e;
                    console.log(eSec);
                    if (e.section_uuid !== 0 && e.activity_uuid == 0) {
                        sectionId = eSec.uuid;
                        if (!sectionObj[sectionId]) {
                            sectionObj[sectionId] = {
                                name: eSec.name,
                                categoryObj: [],
                                sectionRes: []
                            };
                        }

                        if (sectionObj[sectionId] && sectionObj[sectionId].categoryObj) {
                            categoryId = eCat.uuid;
                            if (!sectionObj[sectionId].categoryObj[categoryId]) {
                                sectionObj[sectionId].categoryObj[categoryId] = {
                                    categoryName: eCat.name,
                                    categoryArray: []
                                };
                            }
                        }

                        const val = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
                        const val2 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:00.000Z/;
                        if (val.test(eTermKey)) {
                            if (val2.test(eTermKey)) {
                                eTermKey = emr_utility.indiaTz(eTermKey).format('DD-MMM-YYYY');
                            } else {
                                eTermKey = emr_utility.indiaTz(eTermKey).format('DD-MMM-YYYY hh:mm A');
                            }
                        }

                        console.log('sectionId::', sectionId);
                        console.log('categoryId::', categoryId);


                        if (profSecCatConcept && profSecCatConcept.name) {
                            let {
                                value_type_uuid,
                                name: profCatName
                            } = profSecCatConcept;
                            let {
                                value_name: profCatValValueName
                            } = profSecCatConVal;
                            console.log('value_type_uuid::', value_type_uuid);
                            if ((value_type_uuid == RADIO) || (value_type_uuid == BOOLEAN) || (value_type_uuid == CHECKBOX) || (value_type_uuid == DROPDOWN)) {

                                sampleObj = {
                                    [profCatName]: profCatValValueName ? (profCatValValueName) : eTermKey
                                };
                            } else {
                                sampleObj = {
                                    [profCatName]: profCatValValueName ? (profCatValValueName +
                                        ' (' + (((eTermKey == 'true') || (eTermKey == true) || (eTermKey == '1')) ? 'Yes' : (eTermKey == 'false' ? 'No' : eTermKey)) + '' + (psccvt_uuid !== 0 ? (' - ' + profSecCatConValTerm.concept_value_term.name) : '') + ')') : eTermKey
                                };
                            }
                            console.log('sampleObj::', sampleObj);
                            let {
                                categoryArray
                            } = sectionObj[sectionId].categoryObj[categoryId];
                            if (categoryArray.length !== 0) {
                                if ((value_type_uuid == DROPDOWN || value_type_uuid == TERMBASED || value_type_uuid == CHECKBOX) && concept_uuid == profSecCatConcept.uuid) {
                                    let len = categoryArray.length - 1;
                                    let check = {};
                                    // eslint-disable-next-line no-loop-func
                                    // categoryArray = categoryArray.filter(item=>item !== null);
                                    categoryArray.forEach((item, index) => {
                                        if (item !== null) {
                                            if (index == len) {
                                                if (Object.keys(item) == profSecCatConcept.name) {
                                                    Object.assign(check, item);
                                                }
                                            }
                                        }
                                    });
                                    if (check) {
                                        if (Object.keys(check)[0] == profSecCatConcept.name) {
                                            let name = '';
                                            if ((value_type_uuid == RADIO) || (value_type_uuid == BOOLEAN) || (value_type_uuid == CHECKBOX) || (value_type_uuid == DROPDOWN)) {
                                                name = profCatValValueName ? profCatValValueName : e.term_key;
                                            } else {
                                                name = profCatValValueName ?
                                                    (' ' + profCatValValueName +
                                                        ' (' + (((eTermKey == 'true') || (eTermKey == true) || (eTermKey == '1')) ? 'Yes' : (eTermKey == false ? 'No' : eTermKey))) + '' + (psccvt_uuid !== 0 ? (' - ' + profSecCatConValTerm.concept_value_term.name) : '') + ')' : eTermKey;
                                            }
                                            var value = [...Object.values(check), name];
                                            delete categoryArray[len];

                                            check[profSecCatConcept.name] = value;

                                            categoryArray.push(check);

                                        }
                                    } else {
                                        categoryArray.push(sampleObj);
                                    }
                                } else {
                                    categoryArray.push(sampleObj);
                                }
                                concept_uuid = profSecCatConcept.uuid;
                            } else {
                                categoryArray.push(sampleObj);
                            }


                            // if (sample.length == 0) {
                            //     sample.push(sampleObj);
                            // } else {
                            //     let check = sample.find(item => {
                            //         return Object.keys(item)[0] == e.profile_section_category_concept.name;
                            //     });
                            //     if (check) {
                            //         if (Object.keys(check)[0] == e.profile_section_category_concept.name) {
                            //             let name = '';
                            //             if ((value_type_uuid == BOOLEAN) || (value_type_uuid == CHECKBOX) || (value_type_uuid == DROPDOWN)) {
                            //                 name = e.profile_section_category_concept_value.value_name ? e.profile_section_category_concept_value.value_name : e.term_key;
                            //             } else {
                            //                 name = e.profile_section_category_concept_value.value_name ?
                            //                     (' ' + e.profile_section_category_concept_value.value_name +
                            //                         ' (' + (((e.term_key == 'true') || (e.term_key == true) || (e.term_key == '1')) ? 'Yes' : (e.term_key == false ? 'No' : e.term_key))) + ')' : e.term_key;
                            //             }
                            //             var value = [...Object.values(check), name];
                            //             check[e.profile_section_category_concept.name] = value;
                            //             sample.push(check);
                            //         }
                            //     } else {
                            //         sample.push(sampleObj);
                            //     }
                            // }
                        }
                    }
                }

                console.log('sectionObj::', sectionObj);

                printObj.sectionObj = sectionObj;
                printObj.sectionResult = [...new Set(sample)];
                // sectionObj[sectionId].categoryObj[categoryId].categoryArray.push(sample);
                // sectionObj[sectionId].categoryObj[categoryId].categoryArray = [...new Set(sample)];
                console.log('//////////////////', printObj);
                printObj.printedOn = moment().utcOffset("+05:30").format('DD-MMM-YYYY hh:mm A');
                const facility_result = await getFacilityDetails(req);
                if (facility_result.status) {
                    let {
                        status: data_facility_status,
                        facility_uuid: data_facility_uuid,
                        facility
                    } = facility_result.data;
                    let {
                        facility_printer_setting: facPrSet
                    } = facility;
                    let isFaciltySame = (facility_uuid == data_facility_uuid);
                    printObj.header1 = (isFaciltySame ? (facPrSet ? facPrSet.printer_header1 : facPrSet.pharmacy_print_header1) : '');
                    printObj.header2 = (isFaciltySame ? (facPrSet ? facPrSet.printer_header2 : facPrSet.pharmacy_print_header2) : '');
                    printObj.footer1 = (isFaciltySame ? (facPrSet ? facPrSet.printer_footer1 : facPrSet.pharmacy_print_footer1) : '');
                    printObj.footer2 = (isFaciltySame ? (facPrSet ? facPrSet.printer_footer2 : facPrSet.pharmacy_print_footer2) : '');
                }
                // return res.send({
                //     message: printObj
                // });
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
            user_uuid,
            facility_uuid
        } = req.headers;
        let postData = req.body;
        if (user_uuid) {
            postData.is_active = postData.status = true;
            postData.created_by = postData.modified_by = user_uuid;
            postData.created_date = postData.modified_date = new Date();
            postData.revision = 1;
            postData.facility_uuid = facility_uuid;
            try {
                await consultationsTbl.update({
                    is_latest: emr_constants.IS_IN_ACTIVE
                }, {
                    where: {
                        is_latest: emr_constants.IS_ACTIVE,
                        patient_uuid: postData.patient_uuid
                    }
                });
                const consultationsData = await consultationsTbl.create(postData);
                if (consultationsData) {
                    return res.status(200).send({
                        code: httpStatus.OK,
                        message: 'Inserted successfully',
                        reqContents: postData,
                        responseContents: consultationsData
                    });
                } else {
                    return res.status(400).send({
                        code: httpStatus.OK,
                        message: 'Failed to insert',
                        reqContents: postData,
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
        try {
            const {
                user_uuid,
                authorization
            } = req.headers;
            let postData = req.body;
            let currentDate = new Date();
            let suffix_current_value_consult;
            let screenSettings_output;
            postData.is_active = postData.status = true;
            postData.modified_by = user_uuid;
            postData.modified_date = currentDate;
            postData.revision = emr_constants.IS_ACTIVE;
            if (postData.entry_status == emr_constants.ENTRY_STATUS) {
                let options = {
                    uri: config.wso2AppUrl + APPMASTER_GET_SCREEN_SETTINGS,
                    headers: {
                        Authorization: authorization,
                        user_uuid: user_uuid
                    },
                    body: {
                        code: 'OPN'
                    }
                };
                screenSettings_output = await emr_utility.postRequest(options.uri, options.headers, options.body);
                postData.approved_by = user_uuid;
                postData.approved_date = currentDate;
                suffix_current_value_consult = parseInt(screenSettings_output.suffix_current_value) + emr_constants.IS_ACTIVE;
                postData.reference_no = screenSettings_output.prefix + suffix_current_value_consult;
            }
            let consultationsupdate = await consultationsTbl.update(postData, {
                where: {
                    uuid: postData.Id
                }
            });
            if (!consultationsupdate || consultationsupdate[0] == 0) {
                throw {
                    errors: "consultation data not updated",
                    error_type: "validationErr"
                }
            }
            if (postData.entry_status == emr_constants.ENTRY_STATUS) {
                let options_two = {
                    uri: config.wso2AppUrl + APPMASTER_UPDATE_SCREEN_SETTINGS,
                    headers: {
                        Authorization: authorization,
                        user_uuid: user_uuid
                    },
                    body: {
                        screenId: screenSettings_output.uuid,
                        suffix_current_value: suffix_current_value_consult
                    }
                };
                await emr_utility.putRequest(options_two.uri, options_two.headers, options_two.body);
            }
            let consultationsdata = await consultationsTbl.findOne({
                where: {
                    uuid: postData.Id
                },
                include: [{
                    model: profilesTbl,
                    required: false,
                    attributes: ['uuid', 'profile_code', 'profile_name', 'profile_type_uuid', 'profile_description', 'facility_uuid', 'department_uuid', 'created_date']
                }]
            });
            const departmentsResponse = await appMasterData.getDepartments(user_uuid, authorization, [consultationsdata.department_uuid]);
            if (departmentsResponse) {
                const resData = departmentsResponse.responseContent.rows[0];
                consultationsdata.dataValues.department_name = resData.name;
                consultationsdata.dataValues.department_code = resData.code;
            }
            return res.status(200).send({
                code: httpStatus.OK,
                message: 'Update successfully',
                reqContents: req.body,
                responseContents: consultationsdata
            });
        } catch (ex) {
            if (ex.error_type == "validationErr") {
                return res.status(400).send({
                    code: httpStatus.BAD_REQUEST,
                    message: ex.errors
                });
            }
            console.log('Exception happened', ex);
            return res.status(400).send({
                code: httpStatus.BAD_REQUEST,
                message: ex
            });
        }
    };

    function getWidgetData(actCode, result, consultation_uuid, printFlag) {
        switch (actCode) {
            case "Lab":
                return getLabResult(result, consultation_uuid, printFlag);
            case "Radiology":
                return getRadiologyResult(result, consultation_uuid, printFlag);
            case "Prescriptions":
                return getPrescriptionsResult(result, consultation_uuid);
            case "Investigation":
                return getInvestResult(result, consultation_uuid, printFlag);
            case "Vitals":
                return getVitalsResult(result, consultation_uuid);
            case "Chief Complaints":
                return getChiefComplaintsResult(result, consultation_uuid);
            case "Blood Requests":
                return getBloodRequestResult(result, consultation_uuid);
            case "Diagnosis":
                return getDiagnosisResult(result, consultation_uuid);
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

    const getLabResult = async (result, consultation_uuid, printFlag) => {
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
                "consultation_uuid": consultation_uuid,
                "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        console.log(options);
        const user_details = await emr_utility.postRequest(options.uri, options.headers, options.body);
        let res_result = [];
        console.log('////////////////user_details', user_details);
        if (user_details) {
            if (printFlag == true) {
                user_details.forEach((item, i) => {
                    res_result = [...item.pod_arr_result, ...res_result];
                });
                result.dataValues.details = res_result;
            } else {
                result.dataValues.details = user_details;
            }
            return result;
        } else
            return false;
    };
    const getRadiologyResult = async (result, consultation_uuid, printFlag) => {
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
                "consultation_uuid": consultation_uuid,
                "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        console.log(user_details);
        let res_result = [];

        if (user_details && user_details.responseContents) {
            if (printFlag == true) {
                user_details.responseContents.forEach((item, i) => {
                    res_result = [...item.pod_arr_result, ...res_result];
                });
                result.dataValues.details = res_result;
            } else {
                result.dataValues.details = user_details.responseContents;
            }

            return result;
        } else
            return false;
    };
    const getInvestResult = async (result, consultation_uuid, printFlag) => {
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
                "consultation_uuid": consultation_uuid,
                "encounter_uuid": result.encounter_uuid
            },
            //body: {},
            json: true
        };
        const user_details = await rp(options);
        console.log(user_details);
        let res_result = [];
        if (user_details && user_details.responseContents) {
            if (printFlag == true) {
                user_details.responseContents.forEach((item, i) => {
                    res_result = [...item.pod_arr_result, ...res_result];
                });
                console.log('res_result...........', res_result);
                result.dataValues.details = res_result;
            } else {
                result.dataValues.details = user_details.responseContents;
            }
            return result;
        } else
            return false;
    };
    const getVitalsResult = async (result, consultation_uuid) => {
        const user_details = await vw_patientVitalsTbl.findAll({
            where: {
                pv_patient_uuid: result.patient_uuid,
                pv_encounter_uuid: result.encounter_uuid,
                pv_consultation_uuid: consultation_uuid
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
    const getChiefComplaintsResult = async (result, consultation_uuid) => {
        const user_details = await vw_patientCheifTbl.findAll({
            limit: 10,
            order: [
                ['pcc_created_date', 'DESC']
            ],
            where: {
                pcc_patient_uuid: result.patient_uuid,
                pcc_consultation_uuid: consultation_uuid,
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
    const getDiagnosisResult = async (result, consultation_uuid) => {
        const user_details = await patient_diagnosisTbl.findAll({
            where: {
                patient_uuid: result.patient_uuid,
                consultation_uuid: consultation_uuid,
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
    const getPrescriptionsResult = async (result, consultation_uuid) => {
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
                "consultation_uuid": consultation_uuid,
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
        } else {
            result.dataValues.details = {};
        }
        return result;
    };
    const getBloodRequestResult = async (result, consultation_uuid) => {
        let options = {
            uri: config.wso2BloodBankUrl + 'bloodRequest/getpreviousbloodRequestbyID',
            method: "POST",
            headers: {
                Authorization: result.Authorization,
                user_uuid: result.user_uuid,
                facility_uuid: result.facility_uuid
            },
            body: {
                "patient_uuid": result.patient_uuid,
                "consultation_uuid": consultation_uuid,
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