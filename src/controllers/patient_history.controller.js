// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const patient_history_tbl = sequelizeDb.patient_history;
const patient_history_section_tbl = sequelizeDb.patient_history_sections;
const patient_history_section_value_tbl = sequelizeDb.patient_history_section_values;

const patient_history = () => {

    //H30-44040 patient history, history section and section value insert api is done by vignesh k
    const _create_patient_history = async (req, res) => {

        const { user_uuid } = req.headers;
        const patientHistorySectionValuesData = req.body;

        if (user_uuid > 0 && patientHistorySectionValuesData) {

            try {
                let patientHistoryArr = [];
                for (let i = 0; i < patientHistorySectionValuesData.length; i++) {
                    const patientHistoryObj = {
                        facility_uuid: patientHistorySectionValuesData[i].facility_uuid,
                        department_uuid: patientHistorySectionValuesData[i].department_uuid,
                        patient_uuid: patientHistorySectionValuesData[i].patient_uuid,
                        encounter_uuid: patientHistorySectionValuesData[i].encounter_uuid,
                        encounter_doctor_uuid: patientHistorySectionValuesData[i].encounter_doctor_uuid,
                        treatment_kit_uuid: patientHistorySectionValuesData[i].treatment_kit_uuid,
                        patient_treatment_uuid: patientHistorySectionValuesData[i].patient_treatment_uuid,
                        encounter_type_uuid: patientHistorySectionValuesData[i].encounter_type_uuid,
                        consultation_uuid: patientHistorySectionValuesData[i].consultation_uuid,
                        history_uuid: patientHistorySectionValuesData[i].history_uuid,
                        history_category_uuid: patientHistorySectionValuesData[i].history_category_uuid,
                        history_sub_category_uuid: patientHistorySectionValuesData[i].history_sub_category_uuid,
                        history_duration: patientHistorySectionValuesData[i].history_duration,
                        history_duration_period_uuid: patientHistorySectionValuesData[i].history_duration_period_uuid,
                        comments: patientHistorySectionValuesData[i].comments,
                        status: 1,
                        is_active: 1,
                        created_by: user_uuid,
                        modified_by: user_uuid,
                        created_date: new Date(),
                        modified_date: new Date(),
                        revision: 1
                    }
                    patientHistoryArr.push(patientHistoryObj)
                }

                const patientHistoryCreatedData = await patient_history_tbl.bulkCreate(
                    patientHistoryArr,
                    { returning: true }
                );


                let patientHistorySectionArr = [];
                let patientHistorySectionValuesArr = [];
                for (let i = 0; i < patientHistorySectionValuesData.length; i++) {
                    for (let j = 0; j < patientHistoryCreatedData.length; j++) {
                        if (patientHistorySectionValuesData[i].facility_uuid = patientHistoryCreatedData[j].facility_uuid
                            && patientHistorySectionValuesData[i].department_uuid == patientHistoryCreatedData[j].department_uuid
                            && patientHistorySectionValuesData[i].patient_uuid == patientHistoryCreatedData[j].patient_uuid
                            && patientHistorySectionValuesData[i].encounter_uuid == patientHistoryCreatedData[j].encounter_uuid
                            && patientHistorySectionValuesData[i].encounter_type_uuid == patientHistoryCreatedData[j].encounter_type_uuid
                            && patientHistorySectionValuesData[i].history_uuid == patientHistoryCreatedData[j].history_uuid) {
                            const phSections = patientHistorySectionValuesData[i].patient_history_sections;
                            for (let k = 0; k < phSections.length; k++) {
                                patientHistorySectionValuesArr.push(phSections[k]);
                                const phSectionObj = {
                                    patient_history_uuid: patientHistoryCreatedData[j].uuid,
                                    history_section_uuid: phSections[k].history_section_uuid,
                                    history_section_name: phSections[k].history_section_name,
                                    value_type_uuid: phSections[k].value_type_uuid,
                                    value_type_name: phSections[k].value_type_name,
                                    comments: phSections[k].comments,
                                    status: 1,
                                    is_active: 1,
                                    created_by: user_uuid,
                                    modified_by: user_uuid,
                                    created_date: new Date(),
                                    modified_date: new Date(),
                                    revision: 1
                                }
                                patientHistorySectionArr.push(phSectionObj);
                            }
                        }
                    }
                }

                const patientHistorySectionCreatedData = await patient_history_section_tbl.bulkCreate(
                    patientHistorySectionArr,
                    { returning: true }
                );

                let patientHistorySectionValuesArr_final = [];
                for (let i = 0; i < patientHistorySectionCreatedData.length; i++) {
                    for (let j = 0; j < patientHistorySectionValuesArr.length; j++) {
                        if (
                            patientHistorySectionCreatedData[i].history_section_uuid == patientHistorySectionValuesArr[j].history_section_uuid &&
                            patientHistorySectionCreatedData[i].history_section_name == patientHistorySectionValuesArr[j].history_section_name &&
                            patientHistorySectionCreatedData[i].value_type_uuid == patientHistorySectionValuesArr[j].value_type_uuid
                        ) {
                            const hsSValues = patientHistorySectionValuesArr[j].patient_history_section_values;
                            for (let k = 0; k < hsSValues.length; k++) {
                                const phSectionValues = {
                                    patient_history_section_uuid: patientHistorySectionCreatedData[i].uuid,
                                    history_section_value_uuid: hsSValues[k].history_section_value_uuid,
                                    history_section_value_name: hsSValues[k].history_section_value_name,
                                    comments: hsSValues[k].comments,
                                    is_default: 1,
                                    display_order: 1,
                                    status: 1,
                                    is_active: 1,
                                    created_by: user_uuid,
                                    modified_by: user_uuid,
                                    created_date: new Date(),
                                    modified_date: new Date(),
                                    revision: 1
                                }
                                patientHistorySectionValuesArr_final.push(phSectionValues);
                            }
                        }
                    }
                }

                const patientHistorySectionValueCreatedData = await patient_history_section_value_tbl.bulkCreate(
                    patientHistorySectionValuesArr_final,
                    { returning: true }
                );

                if (patientHistoryCreatedData &&
                    patientHistorySectionCreatedData &&
                    patientHistorySectionValueCreatedData) {
                    return res.status(200).send({
                        statusCode: 200,
                        message: "Patient history, Patient history sections and Patient history section values inserted successfully",
                        responseContents: {
                            patientHistoryData: patientHistoryCreatedData,
                            patientHistorySectionData: patientHistorySectionCreatedData,
                            patientHistorySectionValueData: patientHistorySectionValueCreatedData
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

    //H30-44156 patient history by visit done by vignesh k
    const _get_patient_history_by_visit = async (req, res) => {
        const { user_uuid } = req.headers;
        const patientHistorySearchValue = req.body;

        if (user_uuid > 0 && patientHistorySearchValue) {

            try {

                let findPHQuery = {
                    attributes: ['uuid', 'facility_uuid', 'department_uuid', 'patient_uuid', 'encounter_uuid',
                        'encounter_doctor_uuid', 'patient_treatment_uuid', 'treatment_kit_uuid', 'encounter_type_uuid',
                        'consultation_uuid', 'history_uuid', 'history_category_uuid', 'history_sub_category_uuid',
                        'history_duration', 'history_duration_period_uuid', 'comments'],
                    where: {
                        patient_uuid: patientHistorySearchValue.patient_uuid,
                        encounter_uuid: patientHistorySearchValue.encounter_uuid,
                        encounter_type_uuid: patientHistorySearchValue.encounter_type_uuid,
                        is_active: 1,
                        status: 1
                    }
                }

                const findPHResponse = await patient_history_tbl.findAndCountAll(findPHQuery);
                let patientHistory = findPHResponse.rows;

                let patient_history_uuid = [];
                for (let i = 0; i < patientHistory.length; i++) {
                    patient_history_uuid.push(patientHistory[i].uuid)
                }

                if (findPHResponse.count === 0 || !patient_history_uuid.length) {
                    return res
                        .status(200)
                        .send({
                            statusCode: 200,
                            msg: "No data found!",
                            req: patientHistorySearchValue,
                            responseContents: [],
                            totalRecords: 0
                        });
                }

                let findPHSectionsQuery = {
                    attributes: ['uuid', 'patient_history_uuid', 'history_section_uuid', 'history_section_name',
                        'value_type_uuid', 'value_type_name', 'comments'],
                    where: {
                        patient_history_uuid: { [Op.in]: patient_history_uuid },
                        is_active: 1,
                        status: 1
                    }
                }

                const findPHSectionResponse = await patient_history_section_tbl.findAndCountAll(findPHSectionsQuery);
                let patientHistorySection = findPHSectionResponse.rows;

                let patient_history_section_uuid = [];
                for (let i = 0; i < patientHistorySection.length; i++) {
                    patient_history_section_uuid.push(patientHistorySection[i].uuid)
                }

                let findPHSectionValuesQuery = {
                    attributes: ['uuid', 'patient_history_section_uuid', 'history_section_value_uuid',
                        'history_section_value_name', 'comments'],
                    where: {
                        patient_history_section_uuid: { [Op.in]: patient_history_section_uuid },
                        is_active: 1,
                        status: 1
                    }
                }
                const findPHSectionValuesResponse = await patient_history_section_value_tbl.findAndCountAll(findPHSectionValuesQuery);
                let patientHistorySectionValues = findPHSectionValuesResponse.rows;

                let history_section_and_section_values = [];
                for (let i = 0; i < patientHistorySection.length; i++) {
                    let section_and_sec_values_obj = {
                        uuid: patientHistorySection[i].uuid,
                        patient_history_uuid: patientHistorySection[i].patient_history_uuid,
                        history_section_uuid: patientHistorySection[i].history_section_uuid,
                        history_section_name: patientHistorySection[i].history_section_name,
                        value_type_uuid: patientHistorySection[i].value_type_uuid,
                        value_type_name: patientHistorySection[i].value_type_name,
                        comments: patientHistorySection[i].comments,
                        history_section_values: []
                    }
                    for (let j = 0; j < patientHistorySectionValues.length; j++) {
                        if (patientHistorySection[i].uuid === patientHistorySectionValues[j].patient_history_section_uuid) {
                            section_and_sec_values_obj.history_section_values.push(patientHistorySectionValues[j]);
                        }
                    }
                    history_section_and_section_values.push(section_and_sec_values_obj);
                }


                let patient_hSV_arr = [];
                for (let i = 0; i < patientHistory.length; i++) {
                    const patient_history_obj = {
                        uuid: patientHistory[i].uuid,
                        facility_uuid: patientHistory[i].facility_uuid,
                        department_uuid: patientHistory[i].department_uuid,
                        patient_uuid: patientHistory[i].patient_uuid,
                        encounter_uuid: patientHistory[i].encounter_uuid,
                        encounter_doctor_uuid: patientHistory[i].encounter_doctor_uuid,
                        patient_treatment_uuid: patientHistory[i].patient_treatment_uuid,
                        treatment_kit_uuid: patientHistory[i].treatment_kit_uuid,
                        encounter_type_uuid: patientHistory[i].encounter_type_uuid,
                        consultation_uuid: patientHistory[i].consultation_uuid,
                        history_uuid: patientHistory[i].history_uuid,
                        history_category_uuid: patientHistory[i].history_category_uuid,
                        history_sub_category_uuid: patientHistory[i].history_sub_category_uuid,
                        history_duration: patientHistory[i].history_duration,
                        history_duration_period_uuid: patientHistory[i].history_duration_period_uuid,
                        comments: patientHistory[i].comments,
                        patient_history_sections: []
                    }
                    for (let j = 0; j < history_section_and_section_values.length; j++) {
                        if (patientHistory[i].uuid === history_section_and_section_values[j].patient_history_uuid) {
                            patient_history_obj.patient_history_sections.push(history_section_and_section_values[j]);
                        }
                    }
                    patient_hSV_arr.push(patient_history_obj);
                }

                return res
                    .status(200)
                    .send({
                        statusCode: 200,
                        msg: "Patient history fetched successfully!",
                        totalRecords: patient_hSV_arr.length,
                        responseContents: patient_hSV_arr
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
        create_patient_history: _create_patient_history,
        get_patient_history_by_visit: _get_patient_history_by_visit
    };

}

module.exports = patient_history();