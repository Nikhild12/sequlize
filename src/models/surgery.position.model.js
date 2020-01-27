module.exports = (sequelize, DataTypes) => {
  const SURGERY_POSITION = sequelize.define(
    "surgery_position",
    {
      uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      // 1 to 21 columns
      code: {
        type: DataTypes.STRING(250),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(250),
        allowNull: true
      },

      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1
      },
      revision: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: "surgery_position",
      createdAt: "created_date",
      updatedAt: "modified_date",
      indexes: [
        {
          fields: ["uuid"]
        }
      ]
    }
  );

  return SURGERY_POSITION;
};
