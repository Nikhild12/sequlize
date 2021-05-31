const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  const TICK_SHEET_MASTER = sequelize.define(
    "favourite_master",
    {
      uuid: {
        type: DataTypes.INTEGER,
        // allowNull : false,
        primaryKey: true,
        autoIncrement: true
      },
      favourite_type_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        validate: {
          notNull: true
        }
      },
      code: {
        type: DataTypes.STRING(8),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      is_public: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      facility_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true
        }
      },
      department_uuid: {
        type: DataTypes.INTEGER,
      },
      user_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true
        }
      },
      display_order: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 0
      },

      active_from: {
        type: DataTypes.DATE,
        allowNull: false
      },
      active_to: {
        type: DataTypes.DATE,
        allowNull: true
      },

      comments: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_active: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      status: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      revision: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      lab_uuid: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      created_date: "created_date",
      modified_date: "modified_date",

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      modified_by: {
        type: DataTypes.INTEGER
      },
      description: {
        type: DataTypes.STRING
      }
    },
    {
      freezeTableName: true,
      timestamps: false,
      createAt: "created_date",
      updatedAt: "modified_date"
    }
  );

  TICK_SHEET_MASTER.associate = models => {
    TICK_SHEET_MASTER.hasOne(models.favourite_master_details, {
      foreignKey: "favourite_master_uuid"
    });
  };

  return TICK_SHEET_MASTER;
};
