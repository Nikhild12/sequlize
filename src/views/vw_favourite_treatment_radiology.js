module.exports = (sequelize, DataTypes) => {
  const VW_FAVOURITE_TREATMENT_RADIOLOGY = sequelize.define(
    "vw_favourite_treatment_radiology",
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
      tkrm_treatment_kit_uuid: {
        type: DataTypes.INTEGER
      },
      tkrm_test_master_uuid: {
        type: DataTypes.INTEGER
      },
      rtm_is_active: {
        type: DataTypes.BOOLEAN
      },
      rtm_status: {
        type: DataTypes.BOOLEAN
      },
      tkrm_order_to_location_uuid: {
        type: DataTypes.INTEGER
      },
      tkrm_order_priority_uuid: {
        type: DataTypes.INTEGER
      },
      tkrm_profile_master_uuid: {
        type: DataTypes.INTEGER
      },
      pm_profile_code: {
        type: DataTypes.STRING(255)
      },
      pm_name: {
        type: DataTypes.STRING(255)
      },
      pm_description: {
        type: DataTypes.STRING(255)
      },
      pm_status: {
        type: DataTypes.BOOLEAN
      },
      pm_is_active: {
        type: DataTypes.BOOLEAN
      },
      tm_status: {
        type: DataTypes.BOOLEAN
      },
      tm_is_active: {
        type: DataTypes.BOOLEAN
      },
      tkrm_uuid: {
        type: DataTypes.INTEGER
      }
    },
    {
      freezeTableName: true
    }
  );

  return VW_FAVOURITE_TREATMENT_RADIOLOGY;
};
