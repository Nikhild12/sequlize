// Constants Import
const emr_constants = require("../config/constants");

// Sequelizer Import
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const _getFavouritesAttributes = [
  "df_name",
  "di_name",
  "tsm_userid",
  "tsm_active",
  "tsm_name",
  "tsm_uuid",
  "tsmd_uuid",
  "im_name",
  "im_uuid",
  "dr_uuid",
  "dr_code",
  "dp_name",
  "dp_uuid",
  "dp_code",
  "di_uuid",
  "di_name",
  "di_code",
  "df_uuid",
  "df_code",
  "tsm_display_order",
  "tsmd_duration",
  "tsm_favourite_type_uuid",
  "tsmd_test_master_uuid",
  "cc_name",
  "cc_code",
  "cc_uuid",
  "vm_name",
  "vm_uom",
  "tsm_status",
  "tsmd_test_master_uuid",
  "ltm_code",
  "ltm_name",
  "ltm_description",
  "tmsd_diagnosis_uuid",
  "d_name",
  "d_code",
  "d_description",
  "im_is_emar",
  "sm_uuid",
  "sm_store_code",
  "sm_store_name",
  "tsmd_strength",
  "tsmd_treatment_kit_uuid"
];

const _getAllFavouritesAttributes = () => {
  return [
    "fm_uuid",
    "fm_favourite_type_uuid",
    "fm_is_public",
    "fm_facility_uuid",
    "fm_department_uuid",
    "fm_user_uuid",
    "is_active",
    "fm_status",
    "fm_name",
    "ft_is_active",
    "ft_status",
    "f_uuid",
    "f_name",
    "f_is_active",
    "f_status",
    "d_uuid",
    "d_name",
    "u_salutation_uuid",
    "u_first_name",
    "u_middle_name",
    "u_last_name",
    "u_is_active",
    "u_status",
  ];
};

const _getFavouritesInHumanReadableFormat = (res) => {
  return res.map((r) => {
    return {
      favourite_id: r.fm_uuid,
      favourite_name: r.fm_name,
      favourite_type_id: r.fm_favourite_type_uuid,
      //   favourite_type_name: r.f_name,
      facility_id: r.fm_facility_uuid,
      facility_name: r.f_name,
      department_name: r.d_name,
      department_id: r.d_uuid,
      salutation_id: r.u_salutation_uuid,
      first_name: r.u_first_name,
      middle_name: r.u_middle_name,
      last_name: r.u_last_name,
      favourite_status: r.fm_status,
    };
  });
};

const _getSearchKeyWhere = (key, value) => {
  if (key === "name") {
    return {
      fm_name: value,
    };
  } else if (key === "favourite_type") {
    return {
      fm_favourite_type_uuid: value,
    };
  } else if (key === "favourite_status") {
    return {
      fm_status: value,
    };
  }
};

const _favouriteDuplicateMessage = (favList, sKey, sVal, dO) => {
  let duplicate_msg, duplicate_code;
  const foundFavByItem = favList.find((c) => {
    return c[sKey] === sVal;
  });

  const foundFavByDO = favList.find((c) => {
    return c["tsm_display_order"] === Number(dO);
  });

  if (foundFavByItem && foundFavByItem[sKey]) {
    duplicate_msg =
      foundFavByItem.tsm_active[0] === 1
        ? emr_constants.DUPLICATE_ACTIVE_MSG
        : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
    duplicate_code = emr_constants.DUPLICATE_RECORD;
  } else if (foundFavByDO) {
    duplicate_msg = `Already display Order '${dO}' has been added to your Favorite list.`;
    duplicate_code = emr_constants.DUPLICATE_DISPLAY_ORDER;
  }

  return { duplicate_msg, duplicate_code };
};

const favouriteViewAttributes = [
  "fm_uuid",
  "fm_name",
  "fm_department_uuid",
  "fm_user_uuid",
  "fm_favourite_type_uuid",
  "fm_is_public",
  "fm_is_active",
  "fm_display_order",
  "fm_description",
  "fm_status",
  "fmd_uuid",
  "fmd_display_order",
  "fmd_active",
  "fmd_status",
  "fmd_test_master_uuid",
];

const _favouriteLabVWAttributes = () => {
  return [
    ...favouriteViewAttributes,
    "ltm_uuid",
    "ltm_code",
    "ltm_name",
    "ltm_description",
    "ltm_lab_master_type_uuid",
    "ltm_status",
    "ltm_is_active",
    "lpm_uuid",
    "lpm_profile_code",
    "lpm_name",
    "lpm_description",
    "lpm_lab_master_type_uuid",
    "lpm_status",
    "lpm_is_active",
  ];
};

const _favouriteRadVWAttributes = () => {
  return [
    ...favouriteViewAttributes,
    "rtm_uuid",
    "rtm_code",
    "rtm_name",
    "rtm_description",
    "rtm_lab_master_type_uuid",
    "rtm_status",
    "rtm_is_active",
    "rpm_uuid",
    "rpm_profile_code",
    "rpm_name",
    "rpm_description",
    "rpm_lab_master_type_uuid",
    "rpm_status",
    "rpm_is_active",
  ];
};

/**
 *
 * @param {*} uId userId
 * @param {*} dId department Id
 */
const _favouriteLabVWQuery = (uId, dId, labId = 0) => {

  labId = +(labId);
  const labValidation = !labId || labId === 0;
  const searchKey = labValidation ? 'fm_department_uuid' : 'fm_lab_uuid';
  const searchValue = labValidation ? dId : labId;
  
  return {
    fm_is_active: emr_constants.IS_ACTIVE,
    fm_status: emr_constants.IS_ACTIVE,
    fmd_active: emr_constants.IS_ACTIVE,
    fmd_status: emr_constants.IS_ACTIVE,
    [Op.and]: [
      {
        [Op.or]: [
          {
            [searchKey]: { [Op.eq]: searchValue },
            // fm_is_public: { [Op.eq]: emr_constants.IS_ACTIVE },
          },
          { fm_user_uuid: { [Op.eq]: uId } },
        ],
      },
      {
        [Op.or]: [
          {
            ltm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
            ltm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
          },
          {
            lpm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
            lpm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
          },
        ],
      },
    ],
  };
};

const _favouriteRadVWQuery = (uId, dId) => {
  return {
    fm_is_active: emr_constants.IS_ACTIVE,
    fm_status: emr_constants.IS_ACTIVE,
    fmd_active: emr_constants.IS_ACTIVE,
    fmd_status: emr_constants.IS_ACTIVE,
    [Op.and]: [
      {
        [Op.or]: [
          {
            fm_department_uuid: { [Op.eq]: dId },
            // fm_is_public: { [Op.eq]: emr_constants.IS_ACTIVE },
          },
          { fm_user_uuid: { [Op.eq]: uId } },
        ],
      },
      {
        [Op.or]: [
          {
            rtm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
            rtm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
          },
          {
            rpm_status: { [Op.eq]: emr_constants.IS_ACTIVE },
            rpm_is_active: { [Op.eq]: emr_constants.IS_ACTIVE },
          },
        ],
      },
    ],
  };
};

const _favouriteLabResponse = (records) => {
  return records.map((r) => {
    return {
      favourite_id: r.fm_uuid,
      favourite_name: r.ltm_name,
      favourite_active: r.fm_is_active,
      favourite_type_id: r.fm_favourite_type_uuid,
      favourite_display_order: r.fm_display_order,
      test_master_id: r.ltm_uuid,
      test_master_code: r.ltm_code,
      test_master_name: r.ltm_name,
      test_master_description: r.ltm_description,
      profile_master_id: r.lpm_uuid,
      profile_master_code: r.lpm_profile_code,
      profile_master_name: r.lpm_name,
      profile_master_description: r.lpm_description,
    };
  });
};

const _favouriteRadResponse = (records) => {
  return records.map((r) => {
    return {
      favourite_id: r.fm_uuid,
      favourite_name: r.ltm_name,
      favourite_active: r.fm_is_active,
      favourite_type_id: r.fm_favourite_type_uuid,
      favourite_display_order: r.fm_display_order,
      test_master_id: r.rtm_uuid,
      test_master_code: r.rtm_code,
      test_master_name: r.rtm_name,
      test_master_description: r.rtm_description,
      profile_master_id: r.rpm_uuid,
      profile_master_code: r.rpm_profile_code,
      profile_master_name: r.rpm_name,
      profile_master_description: r.rpm_description,
    };
  });
};

const _getFavQuryForCreate = () => {

};

module.exports = {
  getAllFavouritesAttributes: _getAllFavouritesAttributes,
  getFavouritesInHumanReadableFormat: _getFavouritesInHumanReadableFormat,
  getSearchKeyWhere: _getSearchKeyWhere,
  favouriteDuplicateMessage: _favouriteDuplicateMessage,
  favouriteLabVWAttributes: _favouriteLabVWAttributes,
  favouriteLabVWQuery: _favouriteLabVWQuery,
  favouriteRadVWAttributes: _favouriteRadVWAttributes,
  favouriteLabResponse: _favouriteLabResponse,
  favouriteRadVWQuery: _favouriteRadVWQuery,
  favouriteRadResponse: _favouriteRadResponse,
  getFavQuryForCreate: _getFavQuryForCreate,
  getFavouritesAttributes: _getFavouritesAttributes
};
