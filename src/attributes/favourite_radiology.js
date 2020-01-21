const _radiolodyAttributes = [
  "fm_uuid",
  "fm_name",
  "fm_dept",
  "fm_userid",
  "fm_favourite_type_uuid",
  "fm_active",
  "fm_public",
  "fm_status",
  "fm_display_order",
  "rtm_uuid",
  "rtm_code",
  "rtm_name",
  "rtm_description"
];

const _getRadiologyResponse = radiology => {
  return radiology.map(r => {
    return {
      favourite_id: r.fm_uuid,
      favourite_name: r.rtm_name,
      favourite_active: r.fm_active,
      favourite_type_id: r.fm_favourite_type_uuid,
      favourite_active: r.fm_active,
      favourite_display_order: r.fm_display_order,
      test_master_id: r.rtm_uuid,
      test_master_code: r.rtm_code,
      test_master_name: r.rtm_name,
      test_master_description: r.rtm_description
    };
  });
};

module.exports = {
  radiolodyAttributes: _radiolodyAttributes,
  getRadiologyResponse: _getRadiologyResponse
};
