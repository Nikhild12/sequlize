module.exports = (sequelize, DataTypes) => {
  const VM_TICK_SHEET_MASTET_DETAILS = sequelize.define(
    "vw_favourite_master_details", {
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
      tk_name: {
        type: DataTypes.STRING(500)
      },
      tk_code: {
        type: DataTypes.STRING(500)
      },
      tk_uuid: {
        type: DataTypes.INTEGER
      },
      dm_name: {
        type: DataTypes.STRING(500)
      },
      dm_code: {
        type: DataTypes.STRING(500)
      },
      ss_name: {
        type: DataTypes.STRING(500)
      },
      ss_code: {
        type: DataTypes.STRING(500)
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
      im_product_type_uuid: {
        type: DataTypes.INTEGER
      },
      dr_uuid: {
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
      df_nooftimes: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      df_perdayquantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      df_comments: {
        type: DataTypes.STRING(50),
        allowNull: true
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
      tsm_created_date: {
        type: DataTypes.DATE
      },
      tsm_modified_date: {
        type: DataTypes.DATE
      },
      tsm_description: {
        type: DataTypes.STRING
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
      tsmd_profile_master_uuid: {
        type: DataTypes.INTEGER
      },
      tsmd_strength: {
        type: DataTypes.STRING
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
      },
      tsmd_speciality_sketch_uuid: {
        type: DataTypes.INTEGER
      },
      im_is_active: {
        type: DataTypes.BOOLEAN
      },
      im_status: {
        type: DataTypes.BOOLEAN
      },
      cc_is_active: {
        type: DataTypes.BOOLEAN
      },
      cc_status: {
        type: DataTypes.BOOLEAN
      },
      vm_is_active: {
        type: DataTypes.BOOLEAN
      },
      vm_status: {
        type: DataTypes.BOOLEAN
      },
      ltm_is_active: {
        type: DataTypes.BOOLEAN
      },
      ltm_status: {
        type: DataTypes.BOOLEAN
      },
      d_is_active: {
        type: DataTypes.BOOLEAN
      },
      d_status: {
        type: DataTypes.BOOLEAN
      },
      sm_uuid: {
        type: DataTypes.INTEGER
      },
      sm_store_code: {
        type: DataTypes.STRING
      },
      sm_store_name: {
        type: DataTypes.STRING
      },
      tsmd_treatment_kit_uuid: {
        type: DataTypes.INTEGER
      },
      uct_name: {
        type: DataTypes.STRING
      },
      uc_first_name: {
        type: DataTypes.STRING
      },
      uc_middle_name: {
        type: DataTypes.STRING
      },
      uc_last_name: {
        type: DataTypes.STRING
      },
      umt_name: {
        type: DataTypes.STRING
      },
      um_first_name: {
        type: DataTypes.STRING
      },
      um_middle_name: {
        type: DataTypes.STRING
      },
      um_last_name: {
        type: DataTypes.STRING
      },
      fa_uuid: {
        type: DataTypes.INTEGER
      },
      fa_name: {
        type: DataTypes.STRING
      },
      de_uuid: {
        type: DataTypes.INTEGER
      },
      de_name: {
        type: DataTypes.STRING
      },
      si_store_master_uuid: {
        type: DataTypes.INTEGER
      },
      si_uuid: {
        type: DataTypes.INTEGER
      },
      si_is_active: {
        type: DataTypes.BOOLEAN
      },
      si_status: {
        type: DataTypes.BOOLEAN,
      }
    }
  );

  return VM_TICK_SHEET_MASTET_DETAILS;
};