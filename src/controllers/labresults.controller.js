// http Status Import
const httpStatus = require("http-status");

// DB Import
const db = require("../config/sequelize");

// Constants Import
const emr_constants = require("../config/constants");

// Utility Import
const emr_utility = require('../services/utility.service');

const labvw = db.vw_emr_lab_results;

const LabResutlsController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */


  const _getlabreusltsbyid = async (req, res) => {
    const { user_uuid } = req.headers;
    const { patient_order_uuid } = req.query;
    try {
      if (user_uuid > 0 && patient_order_uuid > 0) {

        const result = await labvw.findAll({
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
          where: { po_uuid: patient_order_uuid }
        });
        const code = emr_utility.getResponseCodeForSuccessRequest(result);
        const message = emr_utility.getResponseMessageForSuccessRequest(code, 'lRS');
        return res.status(httpStatus.OK)
          .send({ code, responseContents: result, message });

      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}`
        });
      }
    } catch (err) {
      const message = err.errors ? err.errors[0].message : err.message;
      return res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ code: httpStatus.INTERNAL_SERVER_ERROR, message });
    }
  };

  return {
    getlabreusltsbyid: _getlabreusltsbyid
  };
};

module.exports = LabResutlsController();
