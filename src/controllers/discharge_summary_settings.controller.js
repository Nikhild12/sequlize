// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// EMR Constants Import
const emr_constants = require("../config/constants");

const emr_utility = require("../services/utility.service");

const discharge_summary_tbl = sequelizeDb.discharge_summary_settings;

const dischargeAttributes = require("../attributes/discharge_summary_settings");

const Discharge_Summary_Settings_Controller = () => {
  /**
   * Create API For Discharge Summary Settings
   * @param {*} req
   * @param {*} res
   */
  const _createDischargeSummarySettings = async (req, res) => {
    const { user_uuid } = req.headers;

    const dischargeSummarySettings = req.body;
    const isValidInput =
      Array.isArray(dischargeSummarySettings) &&
      dischargeSummarySettings.length > 0;
    if (user_uuid && isValidInput) {
      try {
        const duplicate = await discharge_summary_tbl.findAll(
          dischargeAttributes.getDischargeSummarySettingsQueryByUserId(
            user_uuid
          )
        );

        if (duplicate && duplicate.length > 0) {
          return res.status(400).send({
            code: emr_constants.DUPLICATE_ENTRIE,
            message: `${emr_constants.DUPLICATE_RECORD} ${emr_constants.GIVEN_USER_UUID}`
          });
        }

        dischargeSummarySettings.forEach(element => {
          element = emr_utility.createIsActiveAndStatus(element, user_uuid);
        });

        const createdDischargeData = await discharge_summary_tbl.bulkCreate(
          dischargeSummarySettings
        );

        if (createdDischargeData) {
          return res.status(200).send({
            code: httpStatus.OK,
            message: "Inserted EMR Workflow Successfully",
            responseContents: dischargeAttributes.attachUUIDToRes(
              dischargeSummarySettings,
              createdDischargeData
            )
          });
        }
      } catch (ex) {
        console.log(ex);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: ex });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };
  return {
    createDischargeSummarySettings: _createDischargeSummarySettings
  };
};

module.exports = Discharge_Summary_Settings_Controller();
