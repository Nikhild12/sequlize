module.exports = (sequelize, DataTypes) => {
    const VW_FAVOURITE_MASTER_DIET = sequelize.define(
        'vw_favourite_master_diet',
        {
            fm_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true

            },
            fm_name: {

                type: DataTypes.STRING(255)

            },
            fm_code: {

                type: DataTypes.STRING(255)

            },
            fm_dept: {

                type: DataTypes.INTEGER

            },
            fm_userid: {

                type: DataTypes.INTEGER

            },
            fm_favourite_type_uuid: {

                type: DataTypes.INTEGER

            },
            fm_active: {

                type: DataTypes.BOOLEAN

            },
            fm_public: {

                type: DataTypes.BOOLEAN

            },

            fm_status: {

                type: DataTypes.BOOLEAN

            },
            fm_display_order: {

                type: DataTypes.INTEGER

            },
            fmd_diet_master_uuid: {

                type: DataTypes.INTEGER

            },
            fmd_diet_frequency_uuid: {

                type: DataTypes.INTEGER

            },
            fmd_diet_category_uuid: {

                type: DataTypes.INTEGER

            },
            dm_code: {

                type: DataTypes.STRING(255)

            },
            dm_name: {

                type: DataTypes.STRING(255)

            },
            df_code: {

                type: DataTypes.STRING(255)

            },
            df_name: {

                type: DataTypes.STRING(255)

            },
            dc_code: {

                type: DataTypes.STRING(255)

            },
            dc_name: {

                type: DataTypes.STRING(255)

            }
        },
        {
            freezeTableName: true
        }
    );

    return VW_FAVOURITE_MASTER_DIET;
};