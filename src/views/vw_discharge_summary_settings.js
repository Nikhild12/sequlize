module.exports = (sequelize, DataTypes) => {
  const VW_DISCHARGE_SUMMARY_SETTINGS = sequelize.define(
    "vw_discharge_summary_settings",
    {
      dss_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      dss_facility_uuid: {
        type: DataTypes.INTEGER
      },
      dss_department_uuid: {
        type: DataTypes.INTEGER
      },
      dss_role_uuid: {
        type: DataTypes.INTEGER
      },
      dss_user_uuid: {
        type: DataTypes.INTEGER
      },
      dss_context_uuid: {
        type: DataTypes.INTEGER
      },
      dss_context_activity_map_uuid: {
        type: DataTypes.INTEGER
      },
      dss_activity_uuid: {
        type: DataTypes.INTEGER
      },
      dss_display_order: {
        type: DataTypes.INTEGER
      },
      dss_is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: "0"
      },
      dss_created_by: {
        type: DataTypes.INTEGER
      },
      dss_created_date: "created_date",
      dss_modified_date: "modified_date",

      dss_modified_by: {
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
        type: DataTypes.STRING(255)
      }
    },
    {
      freezeTableName: true
    }
  );

  return VW_DISCHARGE_SUMMARY_SETTINGS;
};
