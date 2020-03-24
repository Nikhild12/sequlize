// Constants Import
const emr_constants = require("../config/constants");

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
    "u_status"
  ];
};

const _getFavouritesInHumanReadableFormat = res => {
  return res.map(r => {
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
      favourite_status: r.fm_status
    };
  });
};

const _getSearchKeyWhere = (key, value) => {
  if (key === "name") {
    return {
      fm_name: value
    };
  } else if (key === "favourite_type") {
    return {
      fm_favourite_type_uuid: value
    };
  } else if (key === "favourite_status") {
    return {
      fm_status: value
    };
  }
};

const _favouriteDuplicateMessage = (favList, sKey, sVal, dO) => {
  let duplicate_msg, duplicate_code;
  const foundFavByItem = favList.find(c => {
    return c[sKey] === sVal;
  });

  const foundFavByDO = favList.find(c => {
    return c['tsm_display_order'] === Number(dO);
  });

  if (foundFavByItem && foundFavByItem[sKey]) {
    duplicate_msg =
    foundFavByItem.tsm_active[0] === 1
        ? emr_constants.DUPLICATE_ACTIVE_MSG
        : emr_constants.DUPLICATE_IN_ACTIVE_MSG;
    duplicate_code = emr_constants.DUPLICATE_RECORD;
  } else  if(foundFavByDO){
    duplicate_msg = `Already display Order '${dO}' has been added to your Favourite list.`;
    duplicate_code = emr_constants.DUPLICATE_DISPLAY_ORDER;
  }

  return { duplicate_msg, duplicate_code };
};

module.exports = {
  getAllFavouritesAttributes: _getAllFavouritesAttributes,
  getFavouritesInHumanReadableFormat: _getFavouritesInHumanReadableFormat,
  getSearchKeyWhere: _getSearchKeyWhere,
  favouriteDuplicateMessage: _favouriteDuplicateMessage
};
