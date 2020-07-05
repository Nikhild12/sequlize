const emr_constants = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const ENCOUNTER = sequelize.define(
    "encounter",
    {
      uuid: {
        type: DataTypes.INTEGER,
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
            args: 1,
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
      encounter_type_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("encounter_type_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("encounter_type_uuid")
          },
          min: {
            args: 1,
            msg: emr_constants.GetMinimumMessage("encounter_type_uuid")
          }
        }
      },
      encounter_identifier: {
        type: DataTypes.INTEGER
      },
      patient_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("patient_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("patient_uuid")
          },
          min: {
            args: 1,
            msg: emr_constants.GetMinimumMessage("patient_uuid")
          }
        }
      },
      encounter_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active_encounter: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      appointment_uuid: {
        type: DataTypes.INTEGER
      },
      is_followup: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      encounter_status_uuid: {
        type: DataTypes.INTEGER
      },
      admission_request_uuid: {
        type: DataTypes.INTEGER
      },
      admission_uuid: {
        type: DataTypes.INTEGER
      },
      discharge_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      discharge_type_uuid: {
        type: DataTypes.INTEGER
      },
      encounter_priority_uuid: {
        type: DataTypes.INTEGER
      },
      is_mrd_request: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      is_group_casuality: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      revision: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1
      },
      created_by: {
        type: DataTypes.INTEGER
      },
      modified_by: {
        type: DataTypes.INTEGER
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
  ENCOUNTER.associate = model => {
    ENCOUNTER.hasMany(model.encounter_doctors, {
      foreignKey: "encounter_uuid"
    });
    ENCOUNTER.belongsTo(model.encounter_type, {
      foreignKey: "encounter_type_uuid"
    });
  };
  return ENCOUNTER;
};
