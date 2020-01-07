module.exports = (sequelize, DataTypes) => {

    const VW_FAVOURITE_TREATMENT_INVESTIGATION = sequelize.define(
        'vw_favourite_treatment_investigation',
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
            tkim_test_master_uuid: {

                type: DataTypes.INTEGER

            },
            tkim_treatment_kit_uuid: {

                type: DataTypes.INTEGER

            },
            tm_code: {

                type: DataTypes.STRING(255)

            },
            tm_name: {

                type: DataTypes.STRING(255)

            },
            tm_description: {

                type: DataTypes.STRING(255)

            }
        },
        {
            freezeTableName: true
        }
    );

    return VW_FAVOURITE_TREATMENT_INVESTIGATION;
};