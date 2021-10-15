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

    const _create_patient_history = async (req, res) => {

        const { user_uuid } = req.headers;
        const patientHistoryData = req.body;

        if (user_uuid > 0 && patientHistoryData) {

            try {

                patientHistoryData.forEach(hsD => {
                    hsD.status = 1;
                    hsD.is_active = 1;
                    hsD.created_by = user_uuid;
                    hsD.modified_by = user_uuid;

                    hsD.created_date = new Date();
                    hsD.modified_date = new Date();
                    hsD.revision = 1;
                });

                const patientHistoryCreatedData = await patient_history_tbl.bulkCreate(
                    patientHistoryData,
                    { returning: true }
                );

                if (patientHistoryCreatedData) {
                    return res.status(200).send({
                        statusCode: 200,
                        message: "Patient history inserted successfully",
                        responseContents: patientHistoryData
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

    const _create_patient_history_section_and_section_values = async (req, res) => {

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

    return {
        create_patient_history: _create_patient_history,
        create_patient_history_section_and_section_values: _create_patient_history_section_and_section_values
    };

}

module.exports = patient_history();