// Import HttpStatus
const httpStatus = require("http-status");

// Import DB
const db = require("../config/sequelize");

// Import EMR Constants
const emr_constants = require('../config/constants');

// Initialize tbl
const drug_frequencyTbl = db.drug_frequency;

const DrugFrequencyController = () => {
    /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @returns {*}
     */

    const _getDrugFrequency = async (req, res) => {
        const { facility_uuid } = req.headers;
        const { pageNo = 0, paginationSize = 30, sortField = 'modified_date', sortOrder = 'DESC' } = req.query;

        const findQuery = {
            offset: pageNo * paginationSize,
            limit: +(paginationSize),
            where: {
                is_active: emr_constants.IS_ACTIVE,
                status: emr_constants.IS_ACTIVE,
                facility_uuid
            },
            order: [[sortField, sortOrder]],
        };
        try {
            let data = await drug_frequencyTbl.findAndCountAll(findQuery);
            const code = data.rows.length === 0 ? 204 : 200;
            const message = data.rows.length === 0 ? emr_constants.NO_RECORD_FOUND : emr_constants.DRUG_FREQUENCY;
            return res
                .status(httpStatus.OK)
                .json({
                    message, code, responseContents: data.rows, totalRecords: data.count,
                });

        } catch (err) {
            console.log("Exception happened", error);
            return res
                .status(500)
                .send({ code: httpStatus.INTERNAL_SERVER_ERROR, message: error.message });
        }
    };

    return {
        getDrugFrequency: _getDrugFrequency,
    };
};


module.exports = DrugFrequencyController();


