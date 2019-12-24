const httpStatus = require("http-status");
const db = require("../config/sequelize");


const Sequelize = require('sequelize');
var Op = Sequelize.Op;

const emr_const = require('../config/constants');

const diagnosisversionTbl = db.diagnosis_version;

const diagnosisversionController = () => {
     /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
   const getdiagnosisversion=(req,res,next)=>{
    let findQuery = {
        where: {
            uuid,name
          }
    }
    try {
        await diagnosisversionTbl.findAll(
            findQuery)
    .then(async (data) => {
        return await res
          .status(httpStatus.OK)
          .json({
            statusCode: 200,
            message: "Fetched Details successfully",
            responseContents: data.rows
            
          });
      })
  } catch (err) {
    const errorMsg = err.errors ? err.errors[0].message : err.message;
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: errorMsg });
  }
   }
};
module.exports=diagnosisversionController();