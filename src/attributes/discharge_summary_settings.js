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

const _getDischargeViewAttributes = [
  "dss_uuid",
  "dss_facility_uuid",
  "dss_department_uuid",
  "dss_role_uuid",
  "dss_user_uuid",
  "dss_context_uuid",
  "dss_context_activity_map_uuid",
  "dss_activity_uuid",
  "dss_display_order",
  "dss_is_active",
  "activity_code",
  "activity_name",
  "activity_icon",
  "activity_route_url"
];

const _attachUUIDToRes = (assign, target) => {
  return assign.map((a, idx) => {
    a.uuid = target[idx].uuid;
    return a;
  });
};

function _getDischargeViewResponse(emr_data) {
  return emr_data.map(e => {
    return {
      display_order: e.dss_display_order,
      discharge_summary_id: e.dss_uuid,
      facility_uuid: e.dss_facility_uuid,
      role_uuid: e.dss_role_uuid,
      user_uuid: e.dss_user_uuid,
      dss_is_active: e.dss_is_active,
      activity_code: e.activity_code,
      activity_icon: e.activity_icon,
      activity_name: e.activity_name,
      activity_route_url: e.activity_route_url,
      activity_id: e.dss_activity_uuid,
      context_id: e.dss_context_uuid,
      context_activity_map_uuid: e.dss_context_activity_map_uuid
    };
  });
}

module.exports = {
  getDischargeSummarySettingsQueryByUserId: _getDischargeSummarySettingsQueryByUserId,
  attachUUIDToRes: _attachUUIDToRes,
  getDischargeViewAttributes: _getDischargeViewAttributes,
  getDischargeViewResponse: _getDischargeViewResponse
};
