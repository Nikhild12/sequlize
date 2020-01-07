module.exports = (sequelize, DataTypes) => {

    const VW_FAVOURITE_TREATMENT_DIAGNOSIS = sequelize.define(
        'vw_favourite_treatment_diagnosis',
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
            td_code: {

                type: DataTypes.STRING(255)

            },
            td_name: {

                type: DataTypes.STRING(255)

            },
            td_description: {

                type: DataTypes.STRING(255)

            },
            tkdm_diagnosis_uuid: {

                type: DataTypes.INTEGER

            }
        },
        {
            freezeTableName: true
        }
    );

    return VW_FAVOURITE_TREATMENT_DIAGNOSIS;
};