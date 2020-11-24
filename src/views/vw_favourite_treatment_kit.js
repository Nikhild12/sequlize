module.exports = (sequelize, DataTypes) => {
    const VM_FAVOURITE_TREATMENT_KIT = sequelize.define(
        'vw_favourite_treatment_kit',
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
            fm_facilityid: {
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
            }
        },
        {
            freezeTableName: true
        }
    );
    return VM_FAVOURITE_TREATMENT_KIT;
};
