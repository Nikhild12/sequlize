module.exports = (sequelize, DataTypes) => {
    const VW_FAVOURITE_TREATMENT_DRUG = sequelize.define(
        'vw_favourite_treatment_drug',
        {

            fm_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true

            },
            fm_name: {

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
            tk_uuid: {

                type: DataTypes.INTEGER

            },
            tk_code: {

                type: DataTypes.STRING(255)

            },
            tk_name: {

                type: DataTypes.STRING(255)

            },
            tk_treatment_kit_type_uuid: {

                type: DataTypes.INTEGER

            },
            im_code: {

                type: DataTypes.STRING(255)

            },
            im_name: {

                type: DataTypes.STRING(255)

            },
            tkd_item_master_uuid: {

                type: DataTypes.INTEGER

            },
            dr_code: {

                type: DataTypes.STRING(255)

            },
            dr_name: {

                type: DataTypes.STRING(255)

            },
            tkd_drug_route_uuid: {

                type: DataTypes.INTEGER

            },
            df_code: {

                type: DataTypes.STRING(255)

            },
            df_name: {

                type: DataTypes.STRING(255)

            },
            df_display: {

                type: DataTypes.STRING(255)

            },
            tkd_drug_frequency_uuid: {

                type: DataTypes.INTEGER

            },
            dp_code: {

                type: DataTypes.STRING(255)

            },
            dp_name: {

                type: DataTypes.STRING(255)

            },
            tkd_duration_period_uuid: {

                type: DataTypes.INTEGER

            },
            di_code: {

                type: DataTypes.STRING(255)

            },
            di_name: {

                type: DataTypes.STRING(255)

            },
            tkd_drug_instruction_uuid: {

                type: DataTypes.INTEGER

            },
            tkd_quantity: {

                type: DataTypes.STRING(255)

            },
            tkd_duration: {

                type: DataTypes.STRING(255)

            }
        },
        {
            freezeTableName: true
        }
    );

    return VW_FAVOURITE_TREATMENT_DRUG;
}