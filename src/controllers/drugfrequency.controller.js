const httpStatus = require("http-status");
const db = require("../config/sequelize");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const rp = require("request-promise");
var config = require("../config/config");

const drug_frequencyTbl = db.drug_frequency;

const drugfrequencyController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

    const _getDrugFrequency = async (req, res, next) => {
        const { pageNo = 0, paginationSize = 30, sortField = 'modified_date', sortOrder = 'DESC' } = req.query;
        const facility_uuid = req.headers.facility_uuid;
        const message = 'No Data Found';
        let findQuery = {
            offset: pageNo * paginationSize,
            limit: parseInt(paginationSize),
            where: {
                is_active: 1,
                status: 1,
                facility_uuid
            },
            order: [[sortField, sortOrder]],
        };
        try {
            let data = await drug_frequencyTbl.findAndCountAll(findQuery);

            if (data.rows.length === 0) {
                return res
                    .status(httpStatus.OK)
                    .json({
                        code: 204,
                        message,
                        req: ''
                    });
            } else {
                return res
                    .status(httpStatus.OK)
                    .json({
                        message: "success",
                        statusCode: 200,
                        responseContents: data.rows,
                        totalRecords: data.count,

                    });
            }

        } catch (err) {
            const errorMsg = err.errors ? err.errors[0].message : err.message;
            return res
                .status(httpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    message: "error",
                    err: errorMsg
                });
        }
    };

    // --------------------------------------------return----------------------------------
    return {


        getDrugFrequency: _getDrugFrequency,

    };
};


module.exports = drugfrequencyController();


