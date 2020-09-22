const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
  const VW_TEMPLATE_MASTER_DETAILS = sequelize.define(
    "vw_template_master_details",
    {
      tm_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      tm_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      tm_dept: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tm_userid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tm_template_type_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tm_status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["0", "1"]
      },
      tm_active: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["0", "1"]
      },
      tm_public: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["0", "1"]
      },
      tm_description: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      tm_display_order: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tmd_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tmd_display_order: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tmd_test_master_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tmd_duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tmd_is_active: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["0", "1"]
      },
      tmd_status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["0", "1"]
      },
      im_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      im_name: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      im_code: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      im_is_emar: {
        type: DataTypes.BOOLEAN
      },
      im_acive: {
        type: DataTypes.BOOLEAN
        //allowNull: false
        //values: ["0", "1"]
      },
      tmd_strength: {
        type: DataTypes.STRING(45),
        allowNull: true
      },
      dr_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      dr_code: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      df_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      df_code: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      df_name: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      dp_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      dp_code: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      dp_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      di_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      di_code: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      di_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      sm_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      sm_store_code: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      sm_store_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      tm_created_by: {
        type: DataTypes.INTEGER,
      },
      tm_created_date: {
        type: DataTypes.DATE,
      },
      tm_modified_by: {
        type: DataTypes.INTEGER,
      },
      tm_modified_date: {
        type: DataTypes.INTEGER,
      },
      f_uuid: {
        type: DataTypes.INTEGER,
      },
      f_name: {
        type: DataTypes.STRING(100)
      },
      d_uuid: {
        type: DataTypes.INTEGER,
      },
      d_name: {
        type: DataTypes.STRING(100)
      },
      uct_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uc_first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uc_middle_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uc_last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      umt_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      um_first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      um_middle_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      um_last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      si_store_master_uuid: {
        type: DataTypes.INTEGER
      },
      si_uuid: {
        type: DataTypes.INTEGER
      },
      si_is_active: {
        type: DataTypes.BOOLEAN,
      },
      si_status: {
        type: DataTypes.BOOLEAN,
      },
      vm_uuid: {
        type: DataTypes.INTEGER
      },
      vm_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vm_is_active: {
        type: DataTypes.BOOLEAN,
      },
      vm_status: {
        type: DataTypes.BOOLEAN,
      }
    },
    {
      timestamps: false
    }
  );

  return VW_TEMPLATE_MASTER_DETAILS;
};
