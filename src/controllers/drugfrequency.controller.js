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

        let pageNo = 0;
        const { paginationSize = 30 } = getsearch;
        let sortField = 'modified_date';
        let sortOrder = 'DESC';

        if (getsearch.pageNo) {
            let temp = parseInt(getsearch.pageNo);


            if (temp && (temp != NaN)) {
                pageNo = temp;
            }
        }

        const offset = pageNo * paginationSize;


        if (getsearch.sortField) {

            sortField = getsearch.sortField;
        }

        if (getsearch.sortOrder && ((getsearch.sortOrder == 'ASC') || (getsearch.sortOrder == 'DESC'))) {

            sortOrder = getsearch.sortOrder;
        }

        let findQuery = {
            offset: offset,
            limit: paginationSize,
            where: { is_active: 1, status: 1 },
        };


        if (getsearch.hasOwnProperty('status') && /\S/.test(getsearch.status)) {
            findQuery.where['is_active'] = getsearch.status;
        }


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


