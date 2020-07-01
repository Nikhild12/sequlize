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
        let getsearch = req.headers;
        let postData = req.query;

        let pageNo = 0;
        let facility_uuid = getsearch.facility_uuid;
        const { paginationSize = 30 } = postData;
        const { sortField = 'modified_date' } = postData;
        const { sortOrder = 'DESC' } = postData;

        let temp = parseInt(postData.pageNo);

        if (temp && (temp != NaN)) {
            pageNo = temp;
        }
        const offset = pageNo * paginationSize;

        let findQuery = {
            offset: offset,
            limit: parseInt(paginationSize),
            where: {
                is_active: 1,
                status: 1,
                facility_uuid: facility_uuid
            },
            order: [[sortField, sortOrder]],

        };

        try {
            let data = await drug_frequencyTbl.findAndCountAll(findQuery);

            if (data.rows.length == 0) {
                return res
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        message: "success",
                        req: '',
                        msg: "No Data Found"
                    });
            } else {
                return res
                    .status(httpStatus.OK)
                    .json({
                        message: "success",
                        statusCode: 200,
                        responseContents: data.rows,
                        totalRecords: (data.count ? data.count : 0),

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


