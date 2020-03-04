module.exports = (sequelize, DataTypes) => {
  const VM_TICK_SHEET_MASTET_DETAILS = sequelize.define(
    "vw_favourite_master_details",
    {
      tsm_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      tsm_name: {
        type: DataTypes.STRING(500)
      },
      tsmd_uuid: {
        type: DataTypes.INTEGER
      },
      im_uuid: {
        type: DataTypes.INTEGER
      },
      im_name: {
        type: DataTypes.STRING(500)
      },
      im_code: {
        type: DataTypes.STRING(500)
      },
      im_is_emar: {
        type: DataTypes.BOOLEAN
      },
      dr_uuid: {
        type: DataTypes.INTEGER
      },
      df_uuid: {
        type: DataTypes.INTEGER
      },
      dr_code: {
        type: DataTypes.STRING(500)
      },
      df_uuid: {
        type: DataTypes.INTEGER
      },
      df_code: {
        type: DataTypes.STRING(500)
      },
      df_name: {
        type: DataTypes.STRING(500)
      },
      dp_uuid: {
        type: DataTypes.INTEGER
      },
      dp_code: {
        type: DataTypes.STRING(500)
      },
      dp_name: {
        type: DataTypes.INTEGER
      },
      di_uuid: {
        type: DataTypes.INTEGER
      },
      di_code: {
        type: DataTypes.INTEGER
      },
      di_name: {
        type: DataTypes.STRING(500)
      },
      tsm_dept: {
        type: DataTypes.STRING(500)
      },
      tsm_userid: {
        type: DataTypes.INTEGER
      },
      tsm_active: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      tsm_public: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      tsm_display_order: {
        type: DataTypes.INTEGER
      },
      tsmd_duration: {
        type: DataTypes.INTEGER
      },
      tsm_favourite_type_uuid: {
        type: DataTypes.INTEGER
      },
      tsmd_test_master_uuid: {
        type: DataTypes.INTEGER
      },
      cc_uuid: {
        type: DataTypes.INTEGER
      },
      cc_name: {
        type: DataTypes.STRING(500)
      },
      cc_code: {
        type: DataTypes.STRING(500)
      },
      vm_name: {
        type: DataTypes.STRING(500)
      },
      vm_uom: {
        type: DataTypes.STRING(500)
      },
      tsm_status: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      ltm_code: {
        type: DataTypes.STRING(500)
      },
      ltm_name: {
        type: DataTypes.STRING(500)
      },
      ltm_description: {
        type: DataTypes.STRING(500)
      },
      tmsd_diagnosis_uuid: {
        type: DataTypes.INTEGER
      },
      d_code: {
        type: DataTypes.STRING(500)
      },
      d_name: {
        type: DataTypes.STRING(500)
      },
      d_description: {
        type: DataTypes.STRING(500)
      },
      tsmd_diet_master_uuid: {
        type: DataTypes.INTEGER
      }
    }
  );

  return VM_TICK_SHEET_MASTET_DETAILS;
};
