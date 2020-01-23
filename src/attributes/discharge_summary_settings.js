// EMR Constants Import
const emr_constants = require("../config/constants");

// EMR Utility Service
const emr_utility = require("../services/utility.service");

const _getDischargeSummarySettingsQueryByUserId = userId => {
  return {
    where: {
      user_uuid: userId,
      is_active: emr_constants.IS_ACTIVE,
      status: emr_constants.IS_ACTIVE
    }
  };
};

const _attachUUIDToRes = (assign, target) => {
  return assign.map((a, idx) => {
    a.uuid = target[idx].uuid;
    return a;
  });
};

module.exports = {
  getDischargeSummarySettingsQueryByUserId: _getDischargeSummarySettingsQueryByUserId,
  attachUUIDToRes: _attachUUIDToRes
};
