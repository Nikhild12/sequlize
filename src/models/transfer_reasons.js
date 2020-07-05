module.exports = (sequlize, DataTypes) => {

  const transfer_reasons = sequlize.define(
    "transfer_reasons",
    {
      uuid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING(8),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(8),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true

      },
      revision: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      created_date: 'created_date',
      modified_date: 'modified_date',
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      freezeTableName: true,
      timestamps: false,
      createAt: 'created_date',
      updatedAt: 'modified_date'
    }
  );
  return transfer_reasons;

};