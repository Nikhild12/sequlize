module.exports = (sequelize, DataTypes) => {
    const vw_op_notes_details = sequelize.define(
        'vw_op_notes_details',
        {

            p_uuid: {

                type: DataTypes.INTEGER,


            },
            p_profile_code: {

                type: DataTypes.STRING(255),


            },
            p_profile_name: {

                type: DataTypes.STRING(255),

            },
            p_profile_description:
            {

                type: DataTypes.STRING(255),

            },
            p_profile_type_uuid:
            {

                type: DataTypes.INTEGER,


            },
            p_facility_uuid:
            {

                type: DataTypes.INTEGER,


            },
            p_department_uuid:
            {

                type: DataTypes.INTEGER,


            },
            p_status: {

                type: DataTypes.BOOLEAN


            },
            p_is_active: {

                type: DataTypes.BOOLEAN,

            },
            ps_uuid: {

                type: DataTypes.INTEGER,

            },
            ps_profile_uuid:
            {

                type: DataTypes.INTEGER,

            },
            ps_section_uuid:
            {

                type: DataTypes.INTEGER,


            },
            ps_activity_uuid:
            {

                type: DataTypes.INTEGER,


            },
            ps_display_order: {

                type: DataTypes.INTEGER,


            },
            ps_status: {

                type: DataTypes.BOOLEAN,

            },
            ps_is_active: {

                type: DataTypes.BOOLEAN,

            },
            f_uuid: {

                type: DataTypes.INTEGER,


            },
            f_name: {

                type: DataTypes.STRING,


            },
            f_status: {

                type: DataTypes.BOOLEAN,


            },
            f_is_active: {

                type: DataTypes.BOOLEAN,


            },
            d_uuid: {

                type: DataTypes.INTEGER,


            },
            d_name: {

                type: DataTypes.STRING,


            },
            d_status: {

                type: DataTypes.BOOLEAN,


            },
            d_is_active: {

                type: DataTypes.BOOLEAN,


            },
            s_uuid: {

                type: DataTypes.INTEGER,


            },
            s_section_type_uuid: {

                type: DataTypes.INTEGER,


            },
            s_section_note_type_uuid: {

                type: DataTypes.INTEGER,


            },
            s_name: {

                type: DataTypes.STRING,


            },
            s_description: {

                type: DataTypes.STRING,


            },
            s_sref: {

                type: DataTypes.STRING,


            },
            s_display_order: {

                type: DataTypes.INTEGER,


            },
            s_status: {

                type: DataTypes.BOOLEAN,


            },
            s_is_active: {

                type: DataTypes.BOOLEAN,


            },
            c_code: {

                type: DataTypes.STRING,


            },
            c_name: {

                type: DataTypes.STRING,


            },
            c_description: {

                type: DataTypes.STRING,


            },
            c_category_type_uuid: {

                type: DataTypes.INTEGER,


            },
            c_status: {

                type: DataTypes.BOOLEAN,


            },
            c_is_active: {

                type: DataTypes.BOOLEAN,


            },
            pscc_uuid: {

                type: DataTypes.INTEGER,


            },
            pscc_code: {

                type: DataTypes.STRING,


            },
            pscc_name: {

                type: DataTypes.STRING,


            },
            pscc_value_type_uuid: {

                type: DataTypes.INTEGER,


            },
            pscc_profile_section_category_uuid: {

                type: DataTypes.INTEGER,


            },
            pscc_description: {

                type: DataTypes.STRING,


            },
            pscc_is_mandatory: {

                type: DataTypes.BOOLEAN,


            },
            pscc_is_multiple: {

                type: DataTypes.BOOLEAN,


            },
            pscc_display_order: {

                type: DataTypes.INTEGER,


            },
            pscc_status: {

                type: DataTypes.BOOLEAN,


            },
            pscc_is_active: {

                type: DataTypes.BOOLEAN,


            },
            psc_uuid: {

                type: DataTypes.INTEGER,


            },
            psc_profile_section_uuid: {

                type: DataTypes.INTEGER,


            },
            psc_category_uuid: {

                type: DataTypes.INTEGER,


            },
            psc_display_order: {

                type: DataTypes.INTEGER,


            },
            psc_is_active: {

                type: DataTypes.BOOLEAN,


            },
            psc_status: {

                type: DataTypes.BOOLEAN,


            },
            psccv_uuid: {

                type: DataTypes.INTEGER,


            },
            psccv_profile_section_category_concept_uuid: {

                type: DataTypes.INTEGER,


            },
            psccv_value_code: {

                type: DataTypes.STRING,


            },
            psccv_value_name: {

                type: DataTypes.STRING,


            },
            psccv_display_order: {

                type: DataTypes.INTEGER,


            },
            psccv_is_active: {

                type: DataTypes.BOOLEAN,

            },
            psccv_status: {

                type: DataTypes.BOOLEAN,

            },
            a_uuid: {

                type: DataTypes.INTEGER,

            },
            a_code: {

                type: DataTypes.STRING,

            },
            a_name: {

                type: DataTypes.STRING,

            },
            a_is_active: {

                type: DataTypes.BOOLEAN,

            },
            a_status: {

                type: DataTypes.BOOLEAN,

            }

        },
        {
            freezeTableName: true
        }
    );
    return vw_op_notes_details;
};
