module.exports = (sequelize, DataTypes) => {
  const VM_PATIENT_REFERRAL_HISTORY = sequelize.define(
    "vw_patient_referral_history", {
      u_uuid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      ti_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      u_first_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      u_middle_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      u_last_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      u_is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      u_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
      },
      u_created_by: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      d_uuid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      d_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      rd_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      d_is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      d_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
      },
      d_created_by: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      f_uuid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      f_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      rf_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      f_is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
      },
      f_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
      },
      f_created_by: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_uuid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      pr_patient_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_encounter_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_consultation_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_referral_date: {
        type: DataTypes.DATE
      },
      pr_facility_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_department_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_referral_type_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_referral_deptartment_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_referred_by: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_is_reviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
      },
      pr_is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      pr_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      pr_created_by: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pr_referral_comments: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      pr_referal_reason: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
    }, {
      freezeTableName: true
    }
  );

  return VM_PATIENT_REFERRAL_HISTORY;
};