// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const history_tbl = sequelizeDb.historys;
const history_section_tbl = sequelizeDb.history_sections;
const history_section_concept_tbl = sequelizeDb.history_section_concepts;
const history_section_concept_value_tbl = sequelizeDb.history_section_concept_values;
const history_category_tbl = sequelizeDb.history_category;
const history_sub_category_tbl = sequelizeDb.history_sub_category;
const value_type_tbl = sequelizeDb.value_types;

const historys = () => {
    //H30-43597 get history and their section,concept and values by code or name and their category api done by Vignesh K
    const _getHistoryAndSectionsByNameorCode = async (req, res) => {
        try {
            let reqData = req.body;
            if (!reqData.searchValue || !reqData.historyCategoryUuid) {
                return res
                    .status(400)
                    .send({
                        statusCode: 400,
                        req: reqData,
                        msg: "search value and category uuid is required"
                    });
            }

            let findHistoryAndCategoryQuery = {
                attributes: ['uuid', 'code', 'name'],
                where: {
                    uuid: reqData.historyCategoryUuid,
                    is_active: 1,
                    status: 1
                },
                include: [{
                    model: history_tbl,
                    required: false,
                    attributes: ['uuid', 'code', 'name', 'description',
                        'history_category_uuid', 'history_sub_category_uuid',
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

            const findhCResponse = await history_category_tbl.findAndCountAll(findHistoryAndCategoryQuery);
            let hc = findhCResponse.rows;
            let hc_uuid = [];

            for (let i = 0; i < hc.length; i++) {
                if (hc[i].history) {
                    hc_uuid.push(hc[i].history.uuid)
                }
            }

            if (hc.count === 0 || !hc_uuid.length) {
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

            let findQueryHCSection = {
                required: false,
                attributes: ['uuid', 'history_uuid', 'section_name', 'display_order'],
                where: {
                    history_uuid: { [Op.or]: hc_uuid },
                    is_active: 1,
                    status: 1
                }
            }
            const findHcSectionResponse = await history_section_tbl.findAndCountAll(findQueryHCSection);
            let hC_section = findHcSectionResponse.rows;
            let hC_section_uuid = hC_section.reduce((acc, cur) => {
                acc.push(cur.uuid);
                return acc;
            }, []);


            let findQueryHcSectionConcept = {
                required: false,
                attributes: ['uuid', 'concept_name', 'history_section_uuid',
                    'value_type_uuid', 'is_multiple', 'is_mandatory'],
                where: {
                    history_section_uuid: { [Op.or]: hC_section_uuid },
                    is_active: 1,
                    status: 1
                }
            }
            const findHcSectionConceptResponse = await history_section_concept_tbl.findAndCountAll(findQueryHcSectionConcept);
            let hC_section_concept = findHcSectionConceptResponse.rows;
            let hC_section_concept_uuid = hC_section_concept.reduce((acc, cur) => {
                acc.push(cur.uuid);
                return acc;
            }, []);

            let hC_section_concept_value_type_uuid = hC_section_concept.reduce((acc, cur) => {
                acc.push(cur.value_type_uuid);
                return acc;
            }, []);
            let uniq_vt_uuid = [... new Set(hC_section_concept_value_type_uuid)];


            let findValueTypeNameQuery = {
                required: false,
                attributes: ['uuid', 'code', 'name'],
                where: {
                    uuid: { [Op.or]: uniq_vt_uuid },
                    is_active: 1,
                    status: 1
                }
            };
            const findHcSectionValueTypeResponse = await value_type_tbl.findAndCountAll(findValueTypeNameQuery);
            let value_type_concept_value = findHcSectionValueTypeResponse.rows;


            let findQueryHcSectionConceptValues = {
                required: false,
                attributes: ['uuid', 'history_section_concept_uuid',
                    'value_name', 'display_order'],
                where: {
                    history_section_concept_uuid: { [Op.or]: hC_section_concept_uuid },
                    is_active: 1,
                    status: 1
                }
            }
            const findHcSectionConceptValuesResponse = await history_section_concept_value_tbl.findAndCountAll(findQueryHcSectionConceptValues);
            let hC_section_concept_value = findHcSectionConceptValuesResponse.rows;

            let concept_and_values_with_no_vt = [];
            for (let i = 0; i < hC_section_concept.length; i++) {
                let concept_obj = {
                    uuid: hC_section_concept[i].uuid,
                    concept_name: hC_section_concept[i].concept_name,
                    history_section_uuid: hC_section_concept[i].history_section_uuid,
                    value_type_uuid: hC_section_concept[i].value_type_uuid,
                    is_multiple: hC_section_concept[i].is_multiple,
                    is_mandatory: hC_section_concept[i].is_mandatory,
                    history_section_concept_value: []
                };
                for (let j = 0; j < hC_section_concept_value.length; j++) {
                    if (hC_section_concept[i].uuid === hC_section_concept_value[j].history_section_concept_uuid) {
                        concept_obj.history_section_concept_value.push(hC_section_concept_value[j])
                    }
                }
                concept_and_values_with_no_vt.push(concept_obj)
            }

            let concept_and_values = [];
            for (let i = 0; i < concept_and_values_with_no_vt.length; i++) {
                let concept_and_vt_obj = {
                    uuid: concept_and_values_with_no_vt[i].uuid,
                    concept_name: concept_and_values_with_no_vt[i].concept_name,
                    history_section_uuid: concept_and_values_with_no_vt[i].history_section_uuid,
                    value_type_uuid: concept_and_values_with_no_vt[i].value_type_uuid,
                    value_type_name: '',
                    value_type_code: '',
                    is_multiple: concept_and_values_with_no_vt[i].is_multiple,
                    is_mandatory: concept_and_values_with_no_vt[i].is_mandatory,
                    history_section_concept_value: concept_and_values_with_no_vt[i].history_section_concept_value
                }
                for (let j = 0; j < value_type_concept_value.length; j++) {
                    if (concept_and_values_with_no_vt[i].value_type_uuid === value_type_concept_value[j].uuid) {
                        concept_and_vt_obj.value_type_name = value_type_concept_value[j].name;
                        concept_and_vt_obj.value_type_code = value_type_concept_value[j].code;
                    }
                }
                concept_and_values.push(concept_and_vt_obj);
            }

            let section_and_concept_values = [];
            for (let i = 0; i < hC_section.length; i++) {
                const section_concept = {
                    uuid: hC_section[i].uuid,
                    history_uuid: hC_section[i].history_uuid,
                    section_name: hC_section[i].section_name,
                    display_order: hC_section[i].display_order,
                    history_section_concept: []
                }
                for (let j = 0; j < concept_and_values.length; j++) {
                    if (hC_section[i].uuid === concept_and_values[j].history_section_uuid) {
                        section_concept.history_section_concept.push(concept_and_values[j])
                    }
                }
                section_and_concept_values.push(section_concept)
            }

            let hC_section_arr = [];
            for (let i = 0; i < hc.length; i++) {
                let hC_obj = {
                    uuid: hc[i].history.uuid,
                    code: hc[i].history.code,
                    name: hc[i].history.name,
                    category_uuid: hc[i].uuid,
                    category_code: hc[i].code,
                    category_name: hc[i].name,
                    description: hc[i].history.description,
                    history_category_uuid: hc[i].history.history_category_uuid,
                    history_sub_category_uuid: hc[i].history.history_sub_category_uuid,
                    department_uuid: hc[i].history.department_uuid,
                    comments: hc[i].history.comments,
                    history_section: []
                };
                for (let j = 0; j < section_and_concept_values.length; j++) {
                    if (hc[i].history.uuid === section_and_concept_values[j].history_uuid) {
                        hC_obj.history_section.push(section_and_concept_values[j])
                    }
                }
                hC_section_arr.push(hC_obj);
            }

            return res
                .status(httpStatus.OK)
                .json({
                    status: 'success',
                    statusCode: httpStatus.OK,
                    msg: "History details fetched successfully",
                    req: reqData,
                    totalRecords: hC_section_arr.length,
                    responseContents: hC_section_arr
                });


        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.OK)
                .json({
                    status: "error",
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    msg: 'Failed to get history and section details',
                    actualMsg: errorMsg
                });
        }
    };

    return {
        getHistoryAndSectionsByNameorCode: _getHistoryAndSectionsByNameorCode
    };
};

module.exports = historys();