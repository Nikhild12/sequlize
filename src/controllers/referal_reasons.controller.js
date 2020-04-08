const httpStatus = require("http-status");

//Imports required files
const httpStatus = require("http-status");
const emr_constants = require("../config/constants");

const sequelizeDb = require("../config/sequelize");

const referalReasonsTbl = sequelizeDb.referal_reasons;

const ReferalReasosnsController = () => {
  const _getReferalReasons = (req, res) => {
    const { user_uuid } = req.headers;
    try {
      if (user_uuid) {
        const referalResonsData = await referalReasonsTbl.findAll({
          attributes: ['uuid', 'code', 'name', 'is_active', 'statu'],
          where: { is_active: emr_constants.IS_ACTIVE, status: emr_constants.IS_ACTIVE }
        });
        return res.status(200).send({ code: httpStatus.OK, message: 'ReferralReasons Details Fetched Successfully', responseContent: referalResonsData });

      } else {
        return res.status(400).send({
          code: httpStatus[400],
          message: `${emr_constants.NO} ${emr_constants.NO_USER_ID}  ${emr_constants.FOUND}`
        });
      }

    } catch (ex) {
      console.log('Exception Happened', ex);
      return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
    }
  }
  return {
    getReferalReasons: _getReferalReasons
  }
};
module.exports = ReferalReasosnsController();