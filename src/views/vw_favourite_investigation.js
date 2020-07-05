module.exports = (sequelize, DataTypes) => {
  const VW_FAVOURITE_INVESTIGATION = sequelize.define(
    "vw_favourite_investigation",
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
      fm_favourite_type_uuid: {
        type: DataTypes.INTEGER
      },
      tsmd_test_master_uuid: {
        type: DataTypes.INTEGER
      },
      fmd_profile_master_uuid: {
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
      ivtm_uuid: {
        type: DataTypes.INTEGER
      },
      ivtm_code: {
        type: DataTypes.INTEGER
      },
      ivtm_name: {
        type: DataTypes.INTEGER
      },
      ivtm_description: {
        type: DataTypes.INTEGER
      },
      ivpm_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ivpm_profile_code: {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      ivpm_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ivpm_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      ivpm_lab_master_type_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ivpm_status: {
        type: DataTypes.BOOLEAN
      },
      ivpm_is_active: {
        type: DataTypes.BOOLEAN
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
      dp_uuid: {
        type: DataTypes.INTEGER
      },
      dp_name: {
        type: DataTypes.STRING
      }
    },
    {
      freezeTableName: true
    }
  );

  return VW_FAVOURITE_INVESTIGATION;
};
