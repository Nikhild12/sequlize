const httpStatus = require("http-status");

//Imports required files
const emr_constants = require("../config/constants");

const sequelizeDb = require("../config/sequelize");

const transferReasonsTbl = sequelizeDb.transfer_reasons;

const TransferReasosnsController = () => {
  const _getTransferReasons = async (req, res) => {
    const { user_uuid } = req.headers;
    try {
      if (user_uuid) {
        const referalResonsData = await transferReasonsTbl.findAll({
          attributes: ['uuid', 'code', 'name', 'is_active', 'status'],
          where: { is_active: emr_constants.IS_ACTIVE, status: emr_constants.IS_ACTIVE }
        });
        return res.status(200).send({ code: httpStatus.OK, message: 'TransferReasons Details Fetched Successfully', responseContent: referalResonsData });

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
  };
  return {
    getTransferReasons: _getTransferReasons
  };
};
module.exports = TransferReasosnsController();