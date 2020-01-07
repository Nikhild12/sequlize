module.exports = (sequelize, DataTypes) => {

    const VW_FAVOURITE_TREATMENT_DIAGNOSIS = sequelize.define(
        'vw_favourite_treatment_diagnosis',
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
    )

    return VW_FAVOURITE_TREATMENT_DIAGNOSIS;
};