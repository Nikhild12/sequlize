module.exports = (sequelize, DataTypes) => {

    const VW_FAVOURITE_TREATMENT_CHIEF_COMPLAINTS = sequelize.define(
        'vw_favourite_treatment_chief_complaints',
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
            cc_code: {
                type: DataTypes.STRING(255)
            },
            cc_name: {
                type: DataTypes.STRING(255)
            },
            cc: {
                type: DataTypes.STRING(255)
            },
            tkccm_chief_complaint_uuid: {
                type: DataTypes.INTEGER
            },
            tkccm_uuid: {
                type: DataTypes.INTEGER
            },
            tkccm_comments: {
                type: DataTypes.STRING(255)
            },
        },
        {
            freezeTableName: true
        }
    );

    return VW_FAVOURITE_TREATMENT_CHIEF_COMPLAINTS;
};