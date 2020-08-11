const httpStatus = require("http-status");
const db = require("../config/sequelize");

const Sequelize = require("sequelize");

// Constants Import
const emr_constants = require("../config/constants");

const investigationvw = db.vw_emr_investigation_results;

const investigationController = () => {

    /* Returns investigation results */
    const _getInvestigationResultById = async (req, res) => {
        let { user_uuid } = req.headers;
        let { patient_order_uuid } = req.query;
        try {
            if (user_uuid > 0 && patient_order_uuid > 0) {
                const result = await investigationvw.findAll({
                    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                    where: {
                        po_uuid: patient_order_uuid
                    }
                });
                if (result.length > 0) {
                    return res.status(httpStatus.OK).send({
                        statusCode: 200,
                        messsage: "Investigation Result Fetched Successfully",
                        responseContents: result
                    });
                }
                else {
                    return res.status(200).send({ statusCode: 200, message: `${emr_constants.NO_RECORD_FOUND}` });
                }
            }
            else {
                return res.status(400).send({
                    code: httpStatus[400],
                    message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
                });
            }
        }
        catch (err) {
            console.log('Execption Happended', err);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                status: "error",
                msg: err
            });
        }
    };
    return {
        getInvestigationResultById: _getInvestigationResultById
    };
};
module.exports = investigationController();