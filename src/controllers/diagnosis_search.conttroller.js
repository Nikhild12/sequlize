const httpStatus = require("http-status");
const db = require("../config/sequelize");
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
const emr_const = require("../config/constants");

const diagnosisTbl = db.diagnosis;
const diagnosisIcdTbl = db.diagnosis_icd_10;

function getDiagnosSearch(searchValue) {
  return {
    is_active: emr_const.IS_ACTIVE,
    name: {
      [Op.like]: `${searchValue}%`,
    },
  };
};

const diagnosisController = () => {
  /**
     * Returns jwt token if valid username and password is provided
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */

  // H30-48750 Api for diagnosis search (khurshid) -------start
  const _getDiagnosisSearch = async (req, res) => {
    const { user_uuid } = req.headers;
    const { searchValue } = req.body;
    if (searchValue) {
      try {
        const diagnosisData = await diagnosisTbl.findAll({
          where: getDiagnosSearch(searchValue),
          attributes: ["name", "code", "description"],
        });
        if (diagnosisData && diagnosisData.length > 0) {
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Fetched Diagnosis Data Successfully",
            responseContents: diagnosisData ? diagnosisData : [],
          });
        } else {
          return res
            .status(200)
            .send({ code: httpStatus.OK, message: "No Record Found" });
        }
      } catch (error) {
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST,
          message: error.message,
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: "No Headers Found",
      });
    }
  };
  // H30-48750 Api for diagnosis search (khurshid) -------End

  // H30-48751 api for icd_diagnosis search (khurshid)  ------Start
  const _getDiagnosisIcdSearch = async (req, res) => {
    const { user_uuid } = req.headers;
    const { searchValue } = req.body;
    if (searchValue) {
      try {
        const diagnosisIcdData = await diagnosisIcdTbl.findAll({
          where: getDiagnosSearch(searchValue),
          attributes: ["name", "code", "description"],
        });
        if (diagnosisIcdData && diagnosisIcdData.length > 0) {
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Fetched DiagnosisIcd Data Successfully",
            responseContents: diagnosisIcdData ? diagnosisIcdData : [],
          });
        } else {
          return res
            .status(200)
            .send({ code: httpStatus.OK, message: "No Record Found" });
        }
      } catch (error) {
        return res.status(400).send({
          code: httpStatus.BAD_REQUEST,
          message: error.message,
        });
      }
    } else {
      return res.status(400).send({
        code: httpStatus.BAD_REQUEST,
        message: "No Headers Found",
      });
    }
  };
  // H30-48751 api for icd_diagnosis search (khurshid)  ------End

  return {
    getDiagnosisSearch: _getDiagnosisSearch,
    getDiagnosisIcdSearch: _getDiagnosisIcdSearch
  };
};
module.exports = diagnosisController();
