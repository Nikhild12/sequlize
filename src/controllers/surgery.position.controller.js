const httpStatus = require("http-status");
const db = require("../config/sequelize");

const Sequelize = require("sequelize");
var Op = Sequelize.Op;

// Constants Import
const emr_constants = require("../config/constants");

// tbl
const surgeryPositiontbl = db.surgery_position;

const SurgeryPosition = () => {
  const _getSurgeryPosition = async (req, res) => {
    const { user_uuid } = req.headers;

    if (user_uuid) {
      try {
        const surgeryPositionData = await surgeryPositiontbl.findAll({
          where: {
            is_active: emr_constants.IS_ACTIVE,
            status: emr_constants.IS_ACTIVE
          }
        });

        const responseMessage =
          surgeryPositionData && surgeryPositionData.length > 0
            ? emr_constants.SURGERY_POSITION
            : emr_constants.NO_RECORD_FOUND;
        return res.status(200).send({
          code: httpStatus.OK,
          message: responseMessage,
          responseContents: surgeryPositionData.map(bS => {
            return {
              code: bS.code,
              name: bS.name,
              uuid: bS.uuid
            };
          }),
          responseLength: surgeryPositionData.length
        });
      } catch (error) {
        console.log("Exception happened", error);
        return res
          .status(400)
          .send({ code: httpStatus.BAD_REQUEST, message: error });
      }
    } else {
      return res.status(400).send({
        code: httpStatus[400],
        message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_BODY} ${emr_constants.FOUND}`
      });
    }
  };

  return {
    getSurgeryPosition: _getSurgeryPosition
  };
};

module.exports = SurgeryPosition();
