const httpStatus = require("http-status");
const db = require("../config/sequelize");

const Sequelize = require("sequelize");
var Op = Sequelize.Op;

// Constants Import
const emr_constants = require("../config/constants");

const labvw = db.vw_emr_lab_results;

const LabResutlsController = () => {
  /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

  
  const _getlabreusltsbyid = async (req, res, next) => {
    const {user_uuid} = req.headers;
    const {patient_order_uuid} = req.query;
    try {
    if (user_uuid > 0 && patient_order_uuid > 0){
     const result = await labvw.findOne({
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        where: {
          po_uuid: patient_order_uuid
        }
      });
      if (result) {
        return res.status(httpStatus.OK).json({
          statusCode: 200,
          req: "",
          responseContents: data
        });
      }
    } else {
        return res.status(400).send({
            code: httpStatus[400],
            message: "No Request Body or Search key Found "
          });
    }
    } catch (err) {
      const errorMsg = err.errors ? err.errors[0].message : err.message;
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        msg: errorMsg
      });
    }
  };

  

  // --------------------------------------------return----------------------------------
  return {
    
    getlabreusltsbyid: _getlabreusltsbyid
    
  };
};

module.exports = LabResutlsController();
