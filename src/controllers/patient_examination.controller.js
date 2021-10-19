// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const patient_examination_tbl = sequelizeDb.patient_examinations;
const patient_examination_section_tbl = sequelizeDb.patient_examination_sections;
const patient_examination_section_value_tbl = sequelizeDb.patient_examination_section_values;

const patient_examination = () => {

    //H30-44040 patient examination, examination section and section value insert api is done by vignesh k
    const _create_patient_examination = async (req, res) => {

        const { user_uuid } = req.headers;
        const examinationSectionValuesData = req.body;

        if (user_uuid > 0 && examinationSectionValuesData) {
            try {

                let examinationArr = [];
                for (let i = 0; i < examinationSectionValuesData.length; i++) {
                    const examination_obj = {
                        facility_uuid: examinationSectionValuesData[i].facility_uuid,
                        department_uuid: examinationSectionValuesData[i].department_uuid,
                        patient_uuid: examinationSectionValuesData[i].patient_uuid,
                        encounter_uuid: examinationSectionValuesData[i].encounter_uuid,
                        encounter_doctor_uuid: examinationSectionValuesData[i].encounter_doctor_uuid,
                        patient_treatment_uuid: examinationSectionValuesData[i].patient_treatment_uuid,
                        treatment_kit_uuid: examinationSectionValuesData[i].treatment_kit_uuid,
                        encounter_type_uuid: examinationSectionValuesData[i].encounter_type_uuid,
                        consultation_uuid: examinationSectionValuesData[i].consultation_uuid,
                        examination_uuid: examinationSectionValuesData[i].examination_uuid,
                        examination_category_uuid: examinationSectionValuesData[i].examination_category_uuid,
                        examination_sub_category_uuid: examinationSectionValuesData[i].examination_sub_category_uuid,
                        comments: examinationSectionValuesData[i].comments,
                        status: 1,
                        is_active: 1,
                        created_by: user_uuid,
                        modified_by: user_uuid,
                        created_date: new Date(),
                        modified_date: new Date(),
                        revision: 1
                    }
                    examinationArr.push(examination_obj);
                }

                const examinationCreatedData = await patient_examination_tbl.bulkCreate(
                    examinationArr,
                    { returning: true }
                );

                let patientExaminationSectionArr = [];
                let patientExaminationSectionValuesArr = [];
                for (let i = 0; i < examinationSectionValuesData.length; i++) {
                    for (let j = 0; j < examinationCreatedData.length; j++) {
                        if (examinationSectionValuesData[i].facility_uuid == examinationCreatedData[j].facility_uuid &&
                            examinationSectionValuesData[i].department_uuid == examinationCreatedData[j].department_uuid &&
                            examinationSectionValuesData[i].patient_uuid == examinationCreatedData[j].patient_uuid &&
                            examinationSectionValuesData[i].encounter_uuid == examinationCreatedData[j].encounter_uuid &&
                            examinationSectionValuesData[i].encounter_type_uuid == examinationCreatedData[j].encounter_type_uuid &&
                            examinationSectionValuesData[i].examination_uuid == examinationCreatedData[j].examination_uuid) {
                            const ex_sections = examinationSectionValuesData[i].patient_examination_sections;
                            for (let k = 0; k < ex_sections.length; k++) {
                                patientExaminationSectionValuesArr.push(ex_sections[k]);
                                const ex_sectionObj = {
                                    patient_examination_uuid: examinationCreatedData[j].uuid,
                                    examination_section_uuid: ex_sections[k].examination_section_uuid,
                                    examination_section_name: ex_sections[k].examination_section_name,
                                    value_type_uuid: ex_sections[k].value_type_uuid,
                                    value_type_name: ex_sections[k].value_type_name,
                                    comments: ex_sections[k].comments,
                                    status: 1,
                                    is_active: 1,
                                    created_by: user_uuid,
                                    modified_by: user_uuid,
                                    created_date: new Date(),
                                    modified_date: new Date(),
                                    revision: 1
                                }
                                patientExaminationSectionArr.push(ex_sectionObj);
                            }
                        }
                    }
                }

                const examinationSectionCreatedData = await patient_examination_section_tbl.bulkCreate(
                    patientExaminationSectionArr,
                    { returning: true }
                );


                let examinationSectionValuesArr_final = [];
                for (let i = 0; i < examinationSectionCreatedData.length; i++) {
                    for (let j = 0; j < patientExaminationSectionValuesArr.length; j++) {
                        if (
                            examinationSectionCreatedData[i].examination_section_uuid == patientExaminationSectionValuesArr[j].examination_section_uuid &&
                            examinationSectionCreatedData[i].examination_section_name == patientExaminationSectionValuesArr[j].examination_section_name &&
                            examinationSectionCreatedData[i].value_type_uuid == patientExaminationSectionValuesArr[j].value_type_uuid
                        ) {
                            const exSectionValues = patientExaminationSectionValuesArr[j].patient_examination_section_values;
                            for (let k = 0; k < exSectionValues.length; k++) {
                                const exSectionValues_obj = {
                                    patient_examination_section_uuid: examinationSectionCreatedData[i].uuid,
                                    examination_section_value_uuid: exSectionValues[k].examination_section_value_uuid,
                                    examination_section_value_name: exSectionValues[k].examination_section_value_name,
                                    comments: exSectionValues[k].comments,
                                    status: 1,
                                    is_active: 1,
                                    created_by: user_uuid,
                                    modified_by: user_uuid,
                                    created_date: new Date(),
                                    modified_date: new Date(),
                                    revision: 1
                                }
                                examinationSectionValuesArr_final.push(exSectionValues_obj);
                            }
                        }
                    }
                }

                const examinationSectionValueCreatedData = await patient_examination_section_value_tbl.bulkCreate(
                    examinationSectionValuesArr_final,
                    { returning: true }
                );

                if (examinationCreatedData &&
                    examinationSectionCreatedData &&
                    examinationSectionValueCreatedData) {
                    return res.status(200).send({
                        statusCode: 200,
                        message: "Patient examination, Patient examination sections and Patient examination section values inserted successfully",
                        responseContents: {
                            examinationCreatedData: examinationCreatedData,
                            examinationSectionCreatedData: examinationSectionCreatedData,
                            examinationSectionValueCreatedData: examinationSectionValueCreatedData
                        }
                    });
                }

            } catch (ex) {
                console.log(ex.message);
                return res.status(400).send({ statusCode: 400, message: ex.message });
            }
        } else {
            return res
                .status(400)
                .send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    }

    //H30-44156 patient examination by visit done by vignesh k
    const _get_patient_examination_by_visit = async (req, res) => {
        const { user_uuid } = req.headers;
        const patientExaminationSearchValue = req.body;

        if (user_uuid > 0 && patientExaminationSearchValue) {

            try {
                let findExQuery = {
                    attributes: ['uuid', 'facility_uuid', 'department_uuid', 'patient_uuid',
                        'encounter_uuid', 'encounter_doctor_uuid', 'patient_treatment_uuid', 'treatment_kit_uuid',
                        'encounter_type_uuid', 'consultation_uuid', 'examination_uuid', 'examination_category_uuid',
                        'examination_sub_category_uuid', 'comments'],
                    where: {
                        patient_uuid: patientExaminationSearchValue.patient_uuid,
                        encounter_uuid: patientExaminationSearchValue.encounter_uuid,
                        encounter_type_uuid: patientExaminationSearchValue.encounter_type_uuid,
                        is_active: 1,
                        status: 1
                    }
                }

                const findExResponse = await patient_examination_tbl.findAndCountAll(findExQuery);
                let patientExamination = findExResponse.rows;

                let patient_examination_uuid = [];
                for (let i = 0; i < patientExamination.length; i++) {
                    patient_examination_uuid.push(patientExamination[i].uuid)
                }

                if (findExResponse.count === 0 || !patient_examination_uuid.length) {
                    return res
                        .status(200)
                        .send({
                            statusCode: 200,
                            msg: "No data found!",
                            req: patientExaminationSearchValue,
                            responseContents: [],
                            totalRecords: 0
                        });
                }

                let findPExSectionQuery = {
                    attributes: ['uuid', 'patient_examination_uuid', 'examination_section_uuid', 'examination_section_name',
                        'value_type_uuid', 'value_type_name', 'comments'],
                    where: {
                        patient_examination_uuid: { [Op.in]: patient_examination_uuid },
                        is_active: 1,
                        status: 1
                    }
                }

                const findPExSectionResponse = await patient_examination_section_tbl.findAndCountAll(findPExSectionQuery);
                let patientExaminationSection = findPExSectionResponse.rows;

                let patient_examination_section_uuid = [];
                for (let i = 0; i < patientExaminationSection.length; i++) {
                    patient_examination_section_uuid.push(patientExaminationSection[i].uuid)
                }


                let findPExSectionValuesQuery = {
                    attributes: ['uuid', 'patient_examination_section_uuid', 'examination_section_value_uuid',
                        'examination_section_value_name', 'comments'],
                    where: {
                        patient_examination_section_uuid: { [Op.in]: patient_examination_section_uuid },
                        is_active: 1,
                        status: 1
                    }
                }
                const findPExSectionValuesResponse = await patient_examination_section_value_tbl.findAndCountAll(findPExSectionValuesQuery);
                let patientExaminationSectionValues = findPExSectionValuesResponse.rows;

                let examination_section_and_section_values = [];
                for (let i = 0; i < patientExaminationSection.length; i++) {
                    let ex_section_and_sec_values_obj = {
                        uuid: patientExaminationSection[i].uuid,
                        patient_examination_uuid: patientExaminationSection[i].patient_examination_uuid,
                        examination_section_uuid: patientExaminationSection[i].examination_section_uuid,
                        examination_section_name: patientExaminationSection[i].examination_section_name,
                        value_type_uuid: patientExaminationSection[i].value_type_uuid,
                        value_type_name: patientExaminationSection[i].value_type_name,
                        comments: patientExaminationSection[i].comments,
                        examination_section_values: []
                    }
                    for (let j = 0; j < patientExaminationSectionValues.length; j++) {
                        if (patientExaminationSection[i].uuid === patientExaminationSectionValues[j].patient_examination_section_uuid) {
                            ex_section_and_sec_values_obj.examination_section_values.push(patientExaminationSectionValues[j]);
                        }
                    }
                    examination_section_and_section_values.push(ex_section_and_sec_values_obj);
                }

                let patient_ex_SV_arr = [];
                for (let i = 0; i < patientExamination.length; i++) {
                    const patient_examination_obj = {
                        uuid: patientExamination[i].uuid,
                        facility_uuid: patientExamination[i].facility_uuid,
                        department_uuid: patientExamination[i].department_uuid,
                        patient_uuid: patientExamination[i].patient_uuid,
                        encounter_uuid: patientExamination[i].encounter_uuid,
                        encounter_doctor_uuid: patientExamination[i].encounter_doctor_uuid,
                        patient_treatment_uuid: patientExamination[i].patient_treatment_uuid,
                        treatment_kit_uuid: patientExamination[i].treatment_kit_uuid,
                        encounter_type_uuid: patientExamination[i].encounter_type_uuid,
                        consultation_uuid: patientExamination[i].consultation_uuid,
                        examination_uuid: patientExamination[i].examination_uuid,
                        examination_category_uuid: patientExamination[i].examination_category_uuid,
                        examination_sub_category_uuid: patientExamination[i].examination_sub_category_uuid,
                        comments: patientExamination[i].comments,
                        patient_examination_sections: []
                    }
                    for (let j = 0; j < examination_section_and_section_values.length; j++) {
                        if (patientExamination[i].uuid === examination_section_and_section_values[j].patient_examination_uuid) {
                            patient_examination_obj.patient_examination_sections.push(examination_section_and_section_values[j]);
                        }
                    }
                    patient_ex_SV_arr.push(patient_examination_obj);
                }

                return res
                    .status(200)
                    .send({
                        statusCode: 200,
                        msg: "Patient Examination fetched successfully!",
                        totalRecords: patient_ex_SV_arr.length,
                        responseContents: patient_ex_SV_arr
                    });

            } catch (ex) {
                console.log(ex.message);
                return res.status(400).send({ statusCode: 400, message: ex.message });
            }
        } else {
            return res
                .status(400)
                .send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    }

    return {
        create_patient_examination: _create_patient_examination,
        get_patient_examination_by_visit: _get_patient_examination_by_visit
    };

}

module.exports = patient_examination();