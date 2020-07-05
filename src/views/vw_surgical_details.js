module.exports = (sequelize, DataTypes) => {
  const VW_SURGICAL_DETAILS = sequelize.define(
    "vw_surgical_details",
    {
      institution_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      institution_name: {
        type: DataTypes.STRING(255)

      },
      procedure_name: {
        type: DataTypes.STRING(255)

      },
      ps_performed_date: {
        type: DataTypes.DATE,

      },
      ps_comments: {
        type: DataTypes.STRING(255)

      },
      ps_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ps_facility_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ps_is_active: {

        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false

      },
      ps_status: {

        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false

      },

      ps_created_by: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },
      ps_patient_uuid: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },
      p_uuid: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },
      p_is_active: {

        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false

      },
      p_status: {

        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false

      },
      institution_created_by: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },
      institution_is_active: {

        type: DataTypes.BOOLEAN,
        allowNull: true

      },
      institution_status: {

        type: DataTypes.BOOLEAN,
        allowNull: false

      },

    },
    {
      freezeTableName: true,

    }
  );

  return VW_SURGICAL_DETAILS;
};