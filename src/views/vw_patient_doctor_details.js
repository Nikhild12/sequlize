module.exports = (sequelize, DataTypes) => {
  const VW_PATIENT_DOCTOR_DETAILS = sequelize.define(
    "vw_patient_doctor_details",
    {
      ed_patient_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      ed_encounter_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      ed_doctor_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      ed_department_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      ed_is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      ed_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      ed_created_date: {
        type: DataTypes.DATE
      },
      t_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      t_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      u_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
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
      d_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      d_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    },
    {
      freezeTableName: true,
    }
  );

  return VW_PATIENT_DOCTOR_DETAILS;
};