const emr_constants = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const PATIENT_TREATMENTS = sequelize.define(
    "patient_treatments",
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
            args: [1],
            msg: emr_constants.GetMinimumMessage("patient_uuid")
          }
        }
      },
      encounter_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("encounter_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("encounter_uuid")
          },
          min: {
            args: [1],
            msg: emr_constants.GetMinimumMessage("encounter_uuid")
          }
        }
      },
      encounter_type_uuid: {
        type: DataTypes.INTEGER
      },
      treatment_kit_uuid: {
        type: DataTypes.INTEGER
      },
      treatment_status_uuid: {
        type: DataTypes.INTEGER
      },
      treatment_given_by: {
        type: DataTypes.INTEGER
      },
      treatment_given_date: {
        type: DataTypes.DATE
      },
      tat_start_time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      tat_end_time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active: {

        type: DataTypes.BOOLEAN,
        defaultValue: 1,

      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      revision: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      created_by: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      modified_by: {
        type: DataTypes.INTEGER,
        defaultValue: 0,

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
  PATIENT_TREATMENTS.associate = models => {
    PATIENT_TREATMENTS.belongsTo(models.treatment_kit, {
      foreignKey: "treatment_kit_uuid",
    });
    PATIENT_TREATMENTS.belongsTo(models.encounter_type, {
      foreignKey: "encounter_type_uuid"
    });
  };
  return PATIENT_TREATMENTS;
};
