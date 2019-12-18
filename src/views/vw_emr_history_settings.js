module.exports = (sequelize, DataTypes) => {
    const VM_EMR_HISTORY_SETTING = sequelize.define(
        "vw_emr_history_settings",
        {
            ehs_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            ehs_facility_uuid: {
                type: DataTypes.INTEGER
            },
            ehs_department_uuid: {
                type: DataTypes.INTEGER
            },
            ehs_role_uuid: {
                type: DataTypes.INTEGER
            },
            ehs_user_uuid: {
                type: DataTypes.INTEGER
            },
            ehs_context_uuid: {
                type: DataTypes.INTEGER
            },
            ehs_context_activity_map_uuid: {
                type: DataTypes.INTEGER
            },
            ehs_activity_uuid: {
                type: DataTypes.INTEGER
            },
            ehs_history_view_order: {
                type: DataTypes.INTEGER
            },
            ehs_is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            ehs_created_by: {
                type: DataTypes.INTEGER
            },
            ehs_created_date: 'created_date',
            ehs_modified_date: 'modified_date',

            ehs_modified_by: {
                type: DataTypes.INTEGER
            },
            activity_code: {
                type: DataTypes.STRING(255)
            },
            activity_name: {
                type: DataTypes.STRING(255)
            },
            activity_icon: {
                type: DataTypes.STRING(255)
            },
            activity_route_url: {
                type: DataTypes.STRING(255),
            }


        },
        {
            freezeTableName: true,

        }
    );

    return VM_EMR_HISTORY_SETTING;
}