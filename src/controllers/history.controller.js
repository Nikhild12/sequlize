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

const historys = () => {
    //H30-43597 get history and their section,concept and values by code or name api done by Vignesh K
    const _getHistoryAndSectionsByNameorCode = async (req, res) => {
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
                where: {
                    is_active: 1,
                    status: 1
                },
                include: [{
                    model: history_section_tbl,
                    required: false,
                    where: {
                        is_active: 1,
                        status: 1
                    },
                    include: [{
                        model: history_section_concept_tbl,
                        required: false,
                        where: {
                            is_active: 1,
                            status: 1
                        },
                        include: [{
                            model: history_section_concept_value_tbl,
                            required: false,
                            where: {
                                is_active: 1,
                                status: 1
                            }
                        }]
                    }]
                }]
            }

            findQuery.where = Object.assign(findQuery.where, {
                [Op.or]: [
                    Sequelize.where(Sequelize.col('code'), 'LIKE', '%' + reqData.searchValue + '%'),
                    Sequelize.where(Sequelize.col('name'), 'LIKE', '%' + reqData.searchValue + '%'),
                ]
            });

            const findResponse = await history_tbl.findAndCountAll(findQuery);

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

            let resultArr = [];
            let respArr = findResponse.rows;
      
            for (let i = 0; i < respArr.length; i++) {
              if(respArr[i].history_section){
                resultArr.push(respArr[i]);
              }
            }
      
            return res
                .status(httpStatus.OK)
                .json({
                    status: 'success',
                    statusCode: httpStatus.OK,
                    msg: "History details fetched successfully",
                    req: reqData,
                    totalRecords: resultArr.length,
                    responseContents: resultArr
                });


        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.OK)
                .json({
                    status: "error",
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                    msg: 'Failed to get chief complaints and section details',
                    actualMsg: errorMsg
                });
        }
    };

    return {
        getHistoryAndSectionsByNameorCode: _getHistoryAndSectionsByNameorCode
    };
};

module.exports = historys();