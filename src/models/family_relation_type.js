const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

  const family_relation_type = sequelize.define(
    'family_relation_type',
    {
      uuid: {

        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,

      },
      name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
      },
      code: {
        type: DataTypes.STRING(8),
        allowNull: true
      },
      revision: {

        type: DataTypes.INTEGER,
        allowNull: true

      },
      color: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      language: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      display_order: {
        type: DataTypes.INTEGER,
        allowNull: true

      },
      Is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: true

      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true

      },
      created_by: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },

      modified_by: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true

      }
    },
    {
      tableName: 'family_relation_type',
      createdAt: 'created_date',
      updatedAt: 'modified_date',
      indexes: [{
        fields: ['uuid']
      }]
    }
  );



  return family_relation_type;
};