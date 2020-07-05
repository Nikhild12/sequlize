
// Constants Import
const emr_constants = require("../config/constants");

// Sequelize Import
const Sequelize = require("sequelize");

const Op = Sequelize.Op;
const neQuery = { [Op.ne]: null };


const _getFavouriteSpecialitySketchQuery = (user_id, fav_type_id, dId, fId) => {
    return {
        fm_favourite_type_uuid: fav_type_id,
        fm_status: emr_constants.IS_ACTIVE,
        fm_is_active: emr_constants.IS_ACTIVE,
        fm_user_uuid: user_id,
        fmd_speciality_sketch_uuid: neQuery,
        ss_is_active: emr_constants.IS_ACTIVE,
        ss_status: emr_constants.IS_ACTIVE,
        fm_department_uuid: dId,
        fa_uuid: fId
    };
};


const _getSpecialityFavouriteAtt = [
    "fm_uuid",
    "fm_name",
    "fm_user_uuid",
    "fm_favourite_type_uuid",
    "fm_is_active",
    "fm_is_public",
    "fm_status",
    "fm_display_order",
    "fmd_speciality_sketch_uuid",
    "ss_name",
    "ss_code",
    "ss_description",
    "ss_status",
    "ss_is_active",
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
    "dp_name"
];


const _getSpecialitySketchFavouriteRes = (sketchFav) => {

    return sketchFav.map((f) => {

        return {
            favourite_id: f.fm_uuid,
            favourite_name: f.ss_name,
            favourite_code: f.ss_code,
            speciality_sketch_id: f.fmd_speciality_sketch_uuid,
            created_user_name: `${f.uct_name ? `${f.uct_name} ` : ''}${f.uc_first_name}${f.uc_last_name ? `${f.uc_last_name} ` : ''}`,
            modified_user_name: `${f.umt_name ? `${f.umt_name} ` : ''}${f.um_first_name}${f.um_last_name ? `${f.um_last_name} ` : ''}`,
            facility_name: f.fa_name,
            department_name: f.dp_name,
            favourite_active: f.fm_is_active,
            favourite_display_order: f.fm_display_order
        };

    });

};


module.exports = {
    getFavouriteSpecialitySketchQuery: _getFavouriteSpecialitySketchQuery,
    getSpecialityFavouriteAtt: _getSpecialityFavouriteAtt,
    getSpecialitySketchFavouriteRes: _getSpecialitySketchFavouriteRes
};