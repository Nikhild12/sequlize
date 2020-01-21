// Constants Import
const emr_constants = require("../config/constants");

// Sequelize Import
const Sequelize = require('sequelize');


const Op = Sequelize.Op;
const neQuery = { [Op.ne]: null };

const _investigationAttributes = [
  "fm_uuid",
  "fm_name",
  "fm_dept",
  "fm_userid",
  "fm_favourite_type_uuid",
  "fm_active",
  "fm_public",
  "fm_status",
  "fm_display_order",
  "ivtm_uuid",
  "ivtm_code",
  "ivtm_name",
  "ivtm_description"
];

const _getInvestigationResponse = radiology => {
  return radiology.map(r => {
    return {
      favourite_id: r.fm_uuid,
      favourite_name: r.rtm_name,
      favourite_active: r.fm_active,
      favourite_type_id: r.fm_favourite_type_uuid,
      favourite_active: r.fm_active,
      favourite_display_order: r.fm_display_order,
      test_master_id: r.ivtm_uuid,
      test_master_code: r.ivtm_code,
      test_master_name: r.ivtm_name,
      test_master_description: r.ivtm_description
    };
  });
};

const _getFavouriteInvestigationQuery = (user_id, fav_type_id) => {
  return {
    fm_favourite_type_uuid: fav_type_id,
    fm_status: emr_constants.IS_ACTIVE,
    fm_active: emr_constants.IS_ACTIVE,
    fm_userid: user_id,
    ivtm_uuid: neQuery
  };
};

module.exports = {
  investigationAttributes: _investigationAttributes,
  getInvestigationResponse: _getInvestigationResponse,
  getFavouriteInvestigationQuery: _getFavouriteInvestigationQuery
};
