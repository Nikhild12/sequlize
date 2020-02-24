module.exports = (sequelize, DataTypes) => {
  const VM_PATIENT_PREVIOUS_ORDERS = sequelize.define(
    "vw_patient_pervious_orders",
    {
      pt_uuid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      pt_department_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      pt_patient_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      pt_encounter_type_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      pt_treatment_kit_uuid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      pt_treatment_given_date: {
        type: DataTypes.DATE,

      },
      pt_treatment_given_by: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      pt_is_active: {

        type: DataTypes.BOOLEAN,
        allowNull: false

      },
      pt_status: {

        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false

      },
      d_name: {
        type: DataTypes.STRING(100),
        allowNull: true

      },

      d_is_active: {

        type: DataTypes.BOOLEAN,
        allowNull: true

      },
      d_status: {

        type: DataTypes.BOOLEAN,
        allowNull: false

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
        allowNull: false

      },

      tk_name: {
        type: DataTypes.STRING(100),
        allowNull: true

      },
      tk_user_uuid: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      u1_first_name: {
        type: DataTypes.STRING(255),
        allowNull: true

      },
      u1_middle_name: {
        type: DataTypes.STRING(255),
        allowNull: true

      },
      u1_last_name: {
        type: DataTypes.STRING(255),
        allowNull: true

      },
      tk_is_active: {

        type: DataTypes.BOOLEAN,
        allowNull: true

      },
      tk_status: {

        type: DataTypes.BOOLEAN,
        allowNull: false

      },
      et_name: {
        type: DataTypes.STRING(255),
        allowNull: true

      },
      et_is_active: {

        type: DataTypes.BOOLEAN,
        allowNull: true

      },
      et_status: {

        type: DataTypes.BOOLEAN,
        allowNull: true

      }

    },
    {
      freezeTableName: true,

    }
  );

  return VM_PATIENT_PREVIOUS_ORDERS;
};