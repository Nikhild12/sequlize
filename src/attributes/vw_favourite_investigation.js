// Constants Import
const emr_constants = require("../config/constants");

// Sequelize Import
const Sequelize = require("sequelize");

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
  "fm_created_date",
  "fm_modified_date",
  "fm_display_order",
  "ivtm_uuid",
  "ivtm_code",
  "ivtm_name",
  "ivtm_description",
  "ivpm_uuid",
  "ivpm_profile_code",
  "ivpm_name",
  "ivpm_description",
  "uct_name",
  "uc_first_name",
  "uc_middle_name",
  "uc_last_name",
  "umt_name",
  "um_first_name",
  "um_middle_name",
  "um_last_name",
  "fa_uuid",
  "fa_name",
  "dp_uuid",
  "dp_name",
  "fm_description"
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
      test_master_description: r.ivtm_description,
      profile_master_id: r.ivpm_uuid,
      profile_master_code: r.ivpm_profile_code,
      profile_master_name: r.ivpm_name,
      profile_master_description: r.ivpm_description,
      created_user_name: `${r.uct_name ? `${r.uct_name} ` : ''}${r.uc_first_name}${r.uc_last_name ? `${r.uc_last_name} ` : ''}`,
      modified_user_name: `${r.umt_name ? `${r.umt_name} ` : ''}${r.um_first_name}${r.um_last_name ? `${r.um_last_name} ` : ''}`,
      facility_name: r.fa_name,
      department_name: r.dp_name,
      created_date: r.fm_created_date,
      modified_date: r.fm_modified_date,
      favourite_description: r.fm_description,
      user_uuid: r.fm_userid,
      facility_id: r.fa_uuid,
      department_id: r.dp_uuid
    };
  });
};

const _getFavouriteInvestigationQuery = (user_id, fav_type_id, dId, fId, labId = 0) => {
  labId = +(labId);
  const labValidation = labId && labId > 0;
  const searchKey = labValidation ? 'fm_lab_uuid' : 'fm_dept';
  const searchValue = labValidation ? labId : dId;
  return {
    fm_favourite_type_uuid: fav_type_id,
    fm_status: emr_constants.IS_ACTIVE,
    fm_active: emr_constants.IS_ACTIVE,
    fm_userid: user_id,
    [searchKey]: searchValue,
    fa_uuid: fId,
    // ivtm_uuid: neQuery,
    [Op.or]: [
      {
        ivtm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
        ivtm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
      },
      {
        ivpm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
        ivpm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
      },
    ]

    //ivtm_is_active: emr_constants.IS_ACTIVE,
    //ivtm_status: emr_constants.IS_ACTIVE
  };
};

module.exports = {
  investigationAttributes: _investigationAttributes,
  getInvestigationResponse: _getInvestigationResponse,
  getFavouriteInvestigationQuery: _getFavouriteInvestigationQuery
};
