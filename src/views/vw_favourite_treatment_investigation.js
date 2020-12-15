module.exports = (sequelize, DataTypes) => {
  const VW_FAVOURITE_TREATMENT_INVESTIGATION = sequelize.define(
    "vw_favourite_treatment_investigation",
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
      tk_comments: {
        type: DataTypes.STRING(255)
      },
      tkim_test_master_uuid: {
        type: DataTypes.INTEGER
      },
      tkim_profile_master_uuid: {
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
      },
      ivtm_is_active: {
        type: DataTypes.BOOLEAN
      },
      ivtm_status: {
        type: DataTypes.BOOLEAN
      },
      tkim_order_to_location_uuid: {
        type: DataTypes.INTEGER
      },
      tl_order_to_location_code: { //30653
        type: DataTypes.INTEGER
      },
      tl_order_to_location_name: { //30653
        type: DataTypes.INTEGER
      },
      tkim_order_priority_uuid: {
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
      tkim_uuid: {
        type: DataTypes.INTEGER
      }
    },
    {
      freezeTableName: true
    }
  );

  return VW_FAVOURITE_TREATMENT_INVESTIGATION;
};
