module.exports = (sequelize, DataTypes) => {

    const VW_FAVOURITE_TREATMENT_LAB = sequelize.define(
        'vw_favourite_treatment_lab',
        {
            tk_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true

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
            tk_status: {
                type: DataTypes.BOOLEAN
            },
            tk_active: {
                type: DataTypes.BOOLEAN
            },
            tm_code: {

                type: DataTypes.STRING(255)

            },
            tm_name: {

                type: DataTypes.STRING(255)

            },
            tm_description: {

                type: DataTypes.STRING(255)

            },
            tklm_test_master_uuid: {

                type: DataTypes.INTEGER

            },
            tklm_treatment_kit_uuid: {

                type: DataTypes.INTEGER

            }
        },
        {
            freezeTableName: true
        }
    );

    return VW_FAVOURITE_TREATMENT_LAB;
};