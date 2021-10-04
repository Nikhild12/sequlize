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
                        msg: "search value is required"
                    });
            }

            let findQuery = {
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
                    },
                    include: [{
                        model: examination_section_tbl,
                        required: false,
                        attributes: ['uuid', 'examination_uuid', 'section_name', 'display_order'],
                        where: {
                            is_active: 1,
                            status: 1
                        },
                        include: [{
                            model: examination_section_concept_tbl,
                            required: false,
                            attributes: ['uuid', 'concept_name', 'examination_section_uuid',
                                'value_type_uuid', 'is_multiple', 'is_mandatory'],
                            where: {
                                is_active: 1,
                                status: 1
                            },
                            include: [{
                                model: examination_section_concept_value_tbl,
                                required: false,
                                attributes: ['uuid', 'examination_section_concept_uuid',
                                    'value_name', 'display_order'],
                                where: {
                                    is_active: 1,
                                    status: 1
                                }
                            }]
                        }]
                    }]
                }]
            }
            const findResponse = await examination_category_tbl.findAndCountAll(findQuery);

            if (findResponse.count === 0) {
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

            return res
                .status(httpStatus.OK)
                .json({
                    status: 'success',
                    statusCode: httpStatus.OK,
                    msg: "Examination details fetched successfully",
                    req: reqData,
                    totalRecords: findResponse.count,
                    responseContents: findResponse.rows
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