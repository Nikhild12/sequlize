module.exports = (sequelize, DataTypes) => {
  const VM_SURGICAL_DETAILS = sequelize.define(
    "vw_surgical_details",
    {
      institution_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false
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

      }
    },
    {
      freezeTableName: true,

    }
  );

  return VM_SURGICAL_DETAILS;
};