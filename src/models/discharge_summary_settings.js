const emr_constants = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const discharge_summary_settings = sequelize.define(
    "discharge_summary_settings",
    {
      uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      facility_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("facility_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("facility_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("facility_uuid")
          }
        }
      },
      department_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("department_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("department_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("department_uuid")
          }
        }
      },
      role_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("role_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("role_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("role_uuid")
          }
        }
      },
      user_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("user_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("user_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("user_uuid")
          }
        }
      },
      context_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("context_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("context_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("context_uuid")
          }
        }
      },
      context_activity_map_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("context_activity_map_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("context_activity_map_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("context_activity_map_uuid")
          }
        }
      },
      activity_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("activity_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("activity_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("activity_uuid")
          }
        }
      },

      display_order: {
        type: DataTypes.INTEGER
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: "0",
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: "0",
        allowNull: false
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
      createdAt: "created_date",
      updatedAt: "modified_date",
      indexes: [
        {
          fields: ["uuid"]
        }
      ]
    }
  );
  return discharge_summary_settings;
};
