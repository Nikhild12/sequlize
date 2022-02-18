// Package Import
const httpStatus = require("http-status");
// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const examination_tbl = sequelizeDb.examinations;
const examination_section_tbl = sequelizeDb.examination_sections;
const examination_section_values_tbl = sequelizeDb.examination_section_values;
// const examination_section_concept_tbl = sequelizeDb.examination_section_concepts;
// const examination_section_concept_value_tbl = sequelizeDb.examination_section_concept_values;
const examination_category_tbl = sequelizeDb.examination_category;
const examination_sub_category_tbl = sequelizeDb.examination_sub_category;
const value_type_tbl = sequelizeDb.value_types;

const emr_utilities = require("../services/utility.service");

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
                attributes: ['uuid', 'examination_uuid', 'value_type_uuid', 'section_name', 'display_order'],
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

            let examination_section_value_type_uuid = examination_section.reduce((acc, cur) => {
                acc.push(cur.value_type_uuid);
                return acc;
            }, []);
            let uniq_vt_uuid = [... new Set(examination_section_value_type_uuid)];


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


            // let findQueryExaminationSectionConcept = {
            //     required: false,
            //     attributes: ['uuid', 'concept_name', 'examination_section_uuid',
            //         'value_type_uuid', 'is_multiple', 'is_mandatory'],
            //     where: {
            //         examination_section_uuid: { [Op.or]: examination_section_uuid },
            //         is_active: 1,
            //         status: 1
            //     }
            // }
            // const findExaminationSectionConceptResponse = await examination_section_concept_tbl.findAndCountAll(findQueryExaminationSectionConcept);
            // let examination_section_concept = findExaminationSectionConceptResponse.rows;
            // let examination_section_concept_uuid = examination_section_concept.reduce((acc, cur) => {
            //     acc.push(cur.uuid);
            //     return acc;
            // }, []);


            let findQueryExaminationSectionValues = {
                required: false,
                attributes: ['uuid', 'examination_section_uuid',
                    'value_name', 'display_order'],
                where: {
                    examination_section_uuid: { [Op.or]: examination_section_uuid },
                    is_active: 1,
                    status: 1
                }
            }
            const findExaminationSectionValueResponse = await examination_section_values_tbl.findAndCountAll(findQueryExaminationSectionValues);
            let examination_section_value = findExaminationSectionValueResponse.rows;

            let examination_section_values_with_no_vt = [];
            for (let i = 0; i < examination_section.length; i++) {
                let section_and_values_obj = {
                    uuid: examination_section[i].uuid,
                    examination_uuid: examination_section[i].examination_uuid,
                    value_type_uuid: examination_section[i].value_type_uuid,
                    section_name: examination_section[i].section_name,
                    display_order: examination_section[i].display_order,
                    examination_section_values: []
                }
                for (let j = 0; j < examination_section_value.length; j++) {
                    if (examination_section[i].uuid === examination_section_value[j].examination_section_uuid) {
                        section_and_values_obj.examination_section_values.push(examination_section_value[j])
                    }
                }
                examination_section_values_with_no_vt.push(section_and_values_obj)
            }

            let section_and_values = [];
            for (let i = 0; i < examination_section_values_with_no_vt.length; i++) {
                let concept_and_vt_obj = {
                    uuid: examination_section_values_with_no_vt[i].uuid,
                    examination_uuid: examination_section_values_with_no_vt[i].examination_uuid,
                    section_name: examination_section_values_with_no_vt[i].section_name,
                    value_type_uuid: examination_section_values_with_no_vt[i].value_type_uuid,
                    display_order: examination_section_values_with_no_vt[i].display_order,
                    value_type_name: '',
                    value_type_code: '',
                    examination_section_value: examination_section_values_with_no_vt[i].examination_section_values
                }
                for (let j = 0; j < value_type_concept_value.length; j++) {
                    if (examination_section_values_with_no_vt[i].value_type_uuid === value_type_concept_value[j].uuid) {
                        concept_and_vt_obj.value_type_name = value_type_concept_value[j].name;
                        concept_and_vt_obj.value_type_code = value_type_concept_value[j].code;
                    }
                }
                section_and_values.push(concept_and_vt_obj);
            }

            // let examination_section_and_concept_values = [];
            // for (let i = 0; i < examination_section.length; i++) {
            //     const examination_sections = {
            //         uuid: examination_section[i].uuid,
            //         examination_uuid: examination_section[i].examination_uuid,
            //         section_name: examination_section[i].section_name,
            //         display_order: examination_section[i].display_order,
            //         examination_section_concept: []
            //     }
            //     for (let j = 0; j < concept_and_values.length; j++) {
            //         if (examination_section[i].uuid === concept_and_values[j].examination_section_uuid) {
            //             examination_sections.examination_section_concept.push(concept_and_values[j])
            //         }
            //     }
            //     examination_section_and_concept_values.push(examination_sections)
            // }

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
                for (let j = 0; j < section_and_values.length; j++) {
                    if (examination[i].examination.uuid === section_and_values[j].examination_uuid) {
                        examination_obj.examination_section.push(section_and_values[j])
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
            console.log("..>>======= ERROR ========>..", err);
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

    /**
 * H30-47434-Saju-Migrate history master api from JAVA to NODE
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
    const createExamination = async (req, res) => {
        const { user_uuid } = req.headers;
        let examinationMasterDetails = req.body;

        if (user_uuid && examinationMasterDetails) {
            try {
                const examinationMasterDetailsObj = await createExaminationMasterObject(examinationMasterDetails, user_uuid);

                const createdExamination = await examination_tbl.create(examinationMasterDetailsObj, { returing: true });
                if (createdExamination && createdExamination.uuid > 0) {
                    let examinationSections = [];
                    for (let e of examinationMasterDetails.examinationSectionList) {
                        let reqObj = {
                            section_name: e.sectionName,
                            value_type_uuid: e.valueTypeUuid,
                            display_order: e.displayOrder,
                            is_mandatory: e.isMandatory,
                            revision: e.revision,
                            created_by: user_uuid,
                            is_active: 1,
                            created_date: new Date(),
                            examination_uuid: createdExamination.uuid
                        };
                        let examinationSectionsObject = await examination_section_tbl.create(reqObj, { returing: true });
                        if (examinationSectionsObject && examinationSectionsObject.uuid) {
                            const examinationSectionsValueObject = await createExaminationMasterSectionsValueObject(e.examinationSectionValueList, user_uuid, examinationSectionsObject.uuid);
                            const examinationSectionsValue = await examination_section_values_tbl.bulkCreate(examinationSectionsValueObject, { returing: true });
                            examinationSections.push({ ...e, examinationSectionValueList: examinationSectionsValue });
                        }
                    }
                    examinationMasterDetails.uuid = createdExamination.uuid;
                    examinationMasterDetails.ExaminationSectionList = examinationSections;
                }
                return res.status(200).send({ code: httpStatus.OK, message: "Examination master details added success fully", responseContents: examinationMasterDetails });
            } catch (ex) {
                console.log('Check Error --->', ex)
                return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
            }
        } else {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}` });
        }
    }
    
    const getAllActiveCategory = async (req, res) => {
        try {
            const categoryDetails = await examination_category_tbl.findAll({
                where: {
                    is_active: 1
                },
                order: [['name', 'ASC']]
            });
            return res.send({
                statusCode: 200,
                responseContent: categoryDetails
            });

        } catch (error) {
            console.log('\n error...', error);
            return res.status(500).send({
                statusCode: 500,
                error
            });
        }
    }

    const getAllActiveSubCategory = async (req, res) => {
        try {
            const subCategoryDetails = await examination_sub_category_tbl.findAll({
                where: {
                    is_active: 1
                },
                order: [['name', 'ASC']]
            });
            return res.send({
                statusCode: 200,
                responseContent: subCategoryDetails
            });

        } catch (error) {
            console.log('\n error...', error);
            return res.status(500).send({
                statusCode: 500,
                error
            });
        }
    }

    const getExaminationByUuid = async (req, res) => {
        const { examinationUuid } = req.query;
        
        try {
            let examinationDetails = await examination_tbl.findOne({
                include: [
                    {
                        model: examination_section_tbl,
                        required: false,
                        include: [
                            {
                                model: examination_section_values_tbl,
                                required: false
                            }
                        ],

                    }
                ],
                where: {
                    uuid: examinationUuid
                }
            });

            return res.send({
                statusCode: 200,
                responseContent: examinationDetails
            });
        } catch (error) {
            console.log('\n error...', error);
            return res.status(500).send({
                statusCode: 500,
                error
            });
        }
    }

    const getExaminationList = async (req, res) => {
        const { search, page, pageSize, sortBy, orderBy, status } = req.body;

        try {
            const examinationDetailsLst = await getExaminationDetailsLst(search, page, pageSize, sortBy, orderBy, status);

            return res.send({
                statusCode: 200,
                responseContent: examinationDetailsLst
            });
        } catch (error) {
            console.log('\n error...', error);
            return res.status(500).send({
                statusCode: 500,
                error
            });
        }
    }

    //H30-47434-Saju-Migrate history master api from JAVA to NODE
    return {
        getExaminationAndSectionsByNameorCode: _getExaminationAndSectionsByNameorCode,
        createExamination,
        getAllActiveCategory,
        getAllActiveSubCategory,
        getExaminationByUuid,
        getExaminationList
    };
};

module.exports = examinations();

//H30-47434-Saju-Migrate history master api from JAVA to NODE
const createExaminationMasterObject = (examinationMasterDetails, user_uuid) => {
    examinationMasterDetails.created_by = user_uuid;
    examinationMasterDetails.is_active = 1;
    examinationMasterDetails.created_date = new Date();
    examinationMasterDetails.department_uuid = examinationMasterDetails.departmentUuid;
    examinationMasterDetails.examination_category_uuid = examinationMasterDetails.examinationCategoryUuid;
    examinationMasterDetails.examination_sub_category_uuid = examinationMasterDetails.examinationSubCategoryUuid;

    return examinationMasterDetails;
}

const createExaminationMasterSectionsValueObject = (examinationSectionValueList, user_uuid, examinationSectionsUuid) => {
    let finalData = [];
    for (let e of examinationSectionValueList) {
        finalData.push({
            ...e,
            value_name: e.valueName,
            display_order: e.displayOrder,
            is_default: e.isDefault,
            created_by: user_uuid,
            is_active: 1,
            created_date: new Date(),
            examination_section_uuid: examinationSectionsUuid
        });
    }
    return finalData;
}

async function getExaminationDetailsLst(search, page, pageSize, sortField, sortOrder, status) {

    let history_details_query = "SELECT h.uuid, h.code,h.name,IF(h.is_active=b'1', TRUE, FALSE) AS isActive," +
        " (SELECT NAME FROM examination_category category WHERE category.uuid=h.examination_category_uuid) AS categoryName," +
        " (SELECT NAME FROM examination_sub_category subCategory WHERE subCategory.uuid=h.examination_sub_category_uuid) AS categorySubName " +
        " FROM examinations h WHERE h.status = " + status;
    if (search != null && !emr_utilities.isEmpty(search)) {

        history_details_query = history_details_query + " AND (upper(code) like '%" + search + "%' OR upper(name) like '%" + search + "%' OR " +
            " (h.examination_category_uuid in (select uuid from examination_category where name like '%" + search + "%')) OR " +
            " (h.examination_sub_category_uuid in (select uuid from examination_sub_category where name like '%" + search + "%'))) ";
    }

    if (sortField && sortField != "" && sortOrder && sortOrder != "") {
        history_details_query = history_details_query + " order by h." + sortField + " " + sortOrder;
    }

    page = page ? page : 1;
    const itemsPerPage = pageSize ? pageSize : 10;
    const offset = (page - 1) * itemsPerPage;
    history_details_query = history_details_query + " LIMIT " + itemsPerPage + " OFFSET " + offset;
    console.log(history_details_query)
    const history_details = await sequelizeDb.sequelize.query(history_details_query, {
        type: Sequelize.QueryTypes.SELECT
    });
    return history_details;
}
//H30-47434-Saju-Migrate history master api from JAVA to NODE