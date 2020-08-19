module.exports = (sequelize, DataTypes) => {
  const VW_MY_PATIENT_LIST = sequelize.define(
    "vw_my_patient_list",
    {
      ec_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      patient_uuid: {
        type: DataTypes.INTEGER
      },
      pa_first_name: {
        type: DataTypes.STRING(255)
      },
      pa_middle_name: {
        type: DataTypes.STRING(255)
      },
      pa_last_name: {
        type: DataTypes.STRING(255)
      },
      p_period_uuid: {
        type: DataTypes.INTEGER
      },
      p_is_dob_auto_calculate: {
        type: DataTypes.BOOLEAN
      },
      p_dob: {
        type: DataTypes.DATE
      },
      pe_code: {
        type: DataTypes.STRING(255)
      },
      pe_name: {
        type: DataTypes.STRING(255)
      },
      pa_age: {
        type: DataTypes.STRING(255)
      },
      g_name: {
        type: DataTypes.STRING(255)
      },
      pa_pin: {
        type: DataTypes.STRING(255)
      },
      pd_mobile: {
        type: DataTypes.STRING(255)
      },
      department_name: {
        type: DataTypes.STRING(255)
      },
      d_uuid: {
        type: DataTypes.INTEGER
      },
      ec_doctor_uuid: {
        type: DataTypes.INTEGER
      },
      ec_performed_date: {
        type: DataTypes.DATE
      },
      ec_encounter_uuid: {
        type: DataTypes.INTEGER
      },
      p_old_pin: {
        type: DataTypes.INTEGER
      }
    },
    {
      freezeTableName: true
    }
  );
  return VW_MY_PATIENT_LIST;
};
