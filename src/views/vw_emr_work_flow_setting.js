module.exports = (sequelize, DataTypes) => {
    const VM_EMR_WORK_FLOW_SETTING = sequelize.define(
        "vw_emr_work_flow_setting",
        {
            ews_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            ews_facility_uuid: {
                type: DataTypes.INTEGER
            },
            ews_department_uuid: {
                type: DataTypes.INTEGER
            },
            ews_role_uuid: {
                type: DataTypes.INTEGER
            },
            ews_user_uuid: {
                type: DataTypes.INTEGER
            },
            ews_context_uuid: {
                type: DataTypes.INTEGER
            },
            ews_context_activity_map_uuid: {
                type: DataTypes.INTEGER
            },
            ews_activity_uuid: {
                type: DataTypes.INTEGER
            },
            ews_work_flow_order: {
                type: DataTypes.INTEGER
            },
            ews_is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            ews_created_by: {
                type: DataTypes.INTEGER
            },
            ews_created_date: 'created_date',
            ews_modified_date: 'modified_date',

            ews_modified_by: {
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

    return VM_EMR_WORK_FLOW_SETTING;
};