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
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('department_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('department_uuid')
          },
          min: {
            args: [0],
            msg: emr_constants.GetZeroValidationMessage('department_uuid')
          }
        }
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
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('display_order')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('display_order')
          },
          min: {
            args: [0],
            msg: emr_constants.GetZeroValidationMessage('display_order')
          }
        }
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

      created_date: "created_date",
      modified_date: "modified_date",

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
