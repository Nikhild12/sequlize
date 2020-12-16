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
            tk_is_public: {
                type: DataTypes.BOOLEAN
            },
            tk_share_uuid: {
                type: DataTypes.INTEGER
            },
            tk_description: {
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
            },
            tdkm_uuid: {
                type: DataTypes.INTEGER
            },
            tdkm_comments: {
                type: DataTypes.STRING(255)
            },
        },
        {
            freezeTableName: true
        }
    );

    return VW_FAVOURITE_TREATMENT_DIAGNOSIS;
};