// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const examination_tbl = sequelizeDb.examinations;
const examination_section_tbl = sequelizeDb.examination_sections;
const examination_section_concept_tbl = sequelizeDb.examination_section_concepts;
const examination_section_concept_value_tbl = sequelizeDb.examination_section_concept_values;
const examination_category_tbl = sequelizeDb.examination_category;
const examination_sub_category_tbl = sequelizeDb.examination_sub_category;
const value_type_tbl = sequelizeDb.value_types;


const examinations = () => {
    //H30-43597 get examination and their section,concept and values by code or name and their category api done by Vignesh K
    const _getExaminationAndSectionsByNameorCode = async (req, res) => {
        try {
            let reqData = req.body;
            if (!reqData.searchValue) {
                return res
                    .status(400)
                    .send({
                        statusCode: 400,
                        req: reqData,
                        msg: "search value and category uuid is required"
                    });
            }

            let findExaminationAndCategoryQuery = {
                attributes: ['uuid', 'code', 'name'],
                where: {
                    uuid: reqData.examinationCategoryUuid,
                    is_active: 1,
                    status: 1
                },
                include: [{
                    model: examination_tbl,
                    required: false,
                    attributes: ['uuid', 'code', 'name', 'description',
                        'examination_category_uuid', 'examination_sub_category_uuid',
                        'department_uuid', 'comments'],
                    where: {
                        [Op.or]: [
                            {
                                name: { [Op.like]: '%' + reqData.searchValue + '%' }
                            },
                            {
                                code: { [Op.like]: '%' + reqData.searchValue + '%' }
                            }
                        ],
                        is_active: 1,
                        status: 1
                    }
                }]
            }
            const findExCResponse = await examination_category_tbl.findAndCountAll(findExaminationAndCategoryQuery);
            let examination = findExCResponse.rows;
            let examination_uuid = [];

            for (let i = 0; i < examination.length; i++) {
                if (examination[i].examination) {
                    examination_uuid.push(examination[i].examination.uuid)
                }
            }

            if (findExCResponse.count === 0 || !examination_uuid.length) {
                return res
                    .status(200)
                    .send({
                        statusCode: 200,
                        msg: "No data found!",
                        req: reqData,
                        responseContents: [],
                        totalRecords: 0
                    });
            }

            let findQueryExaminationSection = {
                required: false,
                attributes: ['uuid', 'examination_uuid', 'section_name', 'display_order'],
                where: {
                    examination_uuid: { [Op.or]: examination_uuid },
                    is_active: 1,
                    status: 1
                }
            }
            const findExaminationSectionResponse = await examination_section_tbl.findAndCountAll(findQueryExaminationSection);
            let examination_section = findExaminationSectionResponse.rows;
            let examination_section_uuid = examination_section.reduce((acc, cur) => {
                acc.push(cur.uuid);
                return acc;
            }, []);


            let findQueryExaminationSectionConcept = {
                required: false,
                attributes: ['uuid', 'concept_name', 'examination_section_uuid',
                    'value_type_uuid', 'is_multiple', 'is_mandatory'],
                where: {
                    examination_section_uuid: { [Op.or]: examination_section_uuid },
                    is_active: 1,
                    status: 1
                }
            }
            const findExaminationSectionConceptResponse = await examination_section_concept_tbl.findAndCountAll(findQueryExaminationSectionConcept);
            let examination_section_concept = findExaminationSectionConceptResponse.rows;
            let examination_section_concept_uuid = examination_section_concept.reduce((acc, cur) => {
                acc.push(cur.uuid);
                return acc;
            }, []);

            let examination_section_concept_value_type_uuid = examination_section_concept.reduce((acc, cur) => {
                acc.push(cur.value_type_uuid);
                return acc;
            }, []);
            let uniq_vt_uuid = [... new Set(examination_section_concept_value_type_uuid)];


            let findValueTypeNameQuery = {
                required: false,
                attributes: ['uuid', 'code', 'name'],
                where: {
                    uuid: { [Op.or]: uniq_vt_uuid },
                    is_active: 1,
                    status: 1
                }
            };
            const findExaminationSectionValueTypeResponse = await value_type_tbl.findAndCountAll(findValueTypeNameQuery);
            let value_type_concept_value = findExaminationSectionValueTypeResponse.rows;


            let findQueryExaminationSectionConceptValues = {
                required: false,
                attributes: ['uuid', 'examination_section_concept_uuid',
                    'value_name', 'display_order'],
                where: {
                    examination_section_concept_uuid: { [Op.or]: examination_section_concept_uuid },
                    is_active: 1,
                    status: 1
                }
            }
            const findExaminationSectionConceptValuesResponse = await examination_section_concept_value_tbl.findAndCountAll(findQueryExaminationSectionConceptValues);
            let examination_section_concept_value = findExaminationSectionConceptValuesResponse.rows;

            let examination_concept_and_values_with_no_vt = [];
            for (let i = 0; i < examination_section_concept.length; i++) {
                let concept_obj = {
                    uuid: examination_section_concept[i].uuid,
                    concept_name: examination_section_concept[i].concept_name,
                    examination_section_uuid: examination_section_concept[i].examination_section_uuid,
                    value_type_uuid: examination_section_concept[i].value_type_uuid,
                    is_multiple: examination_section_concept[i].is_multiple,
                    is_mandatory: examination_section_concept[i].is_mandatory,
                    examination_section_concept_value: []
                }
                for (let j = 0; j < examination_section_concept_value.length; j++) {
                    if (examination_section_concept[i].uuid === examination_section_concept_value[j].examination_section_concept_uuid) {
                        concept_obj.examination_section_concept_value.push(examination_section_concept_value[j])
                    }
                }
                examination_concept_and_values_with_no_vt.push(concept_obj)
            }

            let concept_and_values = [];
            for (let i = 0; i < examination_concept_and_values_with_no_vt.length; i++) {
                let concept_and_vt_obj = {
                    uuid: examination_concept_and_values_with_no_vt[i].uuid,
                    concept_name: examination_concept_and_values_with_no_vt[i].concept_name,
                    examination_section_uuid: examination_concept_and_values_with_no_vt[i].examination_section_uuid,
                    value_type_uuid: examination_concept_and_values_with_no_vt[i].value_type_uuid,
                    value_type_name: '',
                    value_type_code: '',
                    is_multiple: examination_concept_and_values_with_no_vt[i].is_multiple,
                    is_mandatory: examination_concept_and_values_with_no_vt[i].is_mandatory,
                    examination_section_concept_value: examination_concept_and_values_with_no_vt[i].examination_section_concept_value

                }
                for (let j = 0; j < value_type_concept_value.length; j++) {
                    if (examination_concept_and_values_with_no_vt[i].value_type_uuid === value_type_concept_value[j].uuid) {
                        concept_and_vt_obj.value_type_name = value_type_concept_value[j].name;
                        concept_and_vt_obj.value_type_code = value_type_concept_value[j].code;
                    }
                }
                concept_and_values.push(concept_and_vt_obj);
            }

            let examination_section_and_concept_values = [];
            for (let i = 0; i < examination_section.length; i++) {
                const examination_sections = {
                    uuid: examination_section[i].uuid,
                    examination_uuid: examination_section[i].examination_uuid,
                    section_name: examination_section[i].section_name,
                    display_order: examination_section[i].display_order,
                    examination_section_concept: []
                }
                for (let j = 0; j < concept_and_values.length; j++) {
                    if (examination_section[i].uuid === concept_and_values[j].examination_section_uuid) {
                        examination_sections.examination_section_concept.push(concept_and_values[j])
                    }
                }
                examination_section_and_concept_values.push(examination_sections)
            }

            let examination_section_arr = [];
            for (let i = 0; i < examination.length; i++) {
                let examination_obj = {
                    uuid: examination[i].examination.uuid,
                    code: examination[i].examination.code,
                    name: examination[i].examination.name,
                    category_uuid: examination[i].uuid,
                    category_code: examination[i].code,
                    category_name: examination[i].name,
                    description: examination[i].examination.description,
                    examination_category_uuid: examination[i].examination.examination_category_uuid,
                    examination_sub_category_uuid: examination[i].examination.examination_sub_category_uuid,
                    department_uuid: examination[i].examination.department_uuid,
                    comments: examination[i].examination.comments,
                    examination_section: []
                }
                for (let j = 0; j < examination_section_and_concept_values.length; j++) {
                    if (examination[i].examination.uuid === examination_section_and_concept_values[j].examination_uuid) {
                        examination_obj.examination_section.push(examination_section_and_concept_values[j])
                    }
                }
                examination_section_arr.push(examination_obj);
            }

            return res
                .status(httpStatus.OK)
                .json({
                    status: 'success',
                    statusCode: httpStatus.OK,
                    msg: "Examination details fetched successfully",
                    req: reqData,
                    totalRecords: examination_section_arr.length,
                    responseContents: examination_section_arr
                });

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.OK)
                .json({
                    status: "error",
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    msg: 'Failed to get examination and section details',
                    actualMsg: errorMsg
                });
        }
    };

    return {
        getExaminationAndSectionsByNameorCode: _getExaminationAndSectionsByNameorCode
    };
};

module.exports = examinations();