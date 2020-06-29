const emr_constants = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const PATIENT_DIAGNOSIS = sequelize.define(
    "patient_diagnosis",
    {
      uuid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      facility_uuid: {
        type: DataTypes.INTEGER
      },
      department_uuid: {
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
            msg: emr_constants.GetZeroValidationMessage("patient_uuid")
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
            args: 1,
            msg: emr_constants.GetZeroValidationMessage("encounter_uuid")
          }
        }
      },
      encounter_doctor_uuid: {
        type: DataTypes.INTEGER
      },
      treatment_kit_uuid: {
        type: DataTypes.INTEGER
      },
      patient_treatment_uuid: {
        type: DataTypes.INTEGER
      },
      encounter_type_uuid: {
        type: DataTypes.INTEGER
      },
      consultation_uuid: {
        type: DataTypes.INTEGER
      },
      diagnosis_uuid: {
        type: DataTypes.INTEGER
      },
      other_diagnosis: {
        type: DataTypes.STRING
      },
      is_snomed: {
        type: DataTypes.BOOLEAN,
        values: ["0", "1"],
        defaultValue: "1"
      },
      is_patient_condition: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      condition_type_uuid: {
        type: DataTypes.INTEGER
      },
      condition_date: {
        type: DataTypes.DATE
      },
      condition_status_uuid: {
        type: DataTypes.INTEGER
      },
      is_chronic: {
        type: DataTypes.ENUM,
        values: ["0", "1"],
        defaultValue: "1"
      },
      category_uuid: {
        type: DataTypes.INTEGER
      },
      type_uuid: {
        type: DataTypes.INTEGER
      },
      grade_uuid: {
        type: DataTypes.INTEGER
      },
      body_site_uuid: {
        type: DataTypes.INTEGER
      },
      performed_by: {
        type: DataTypes.INTEGER
      },
      performed_date: {
        type: DataTypes.DATE
      },
      prescription_uuid: {
        type: DataTypes.INTEGER
      },
      patient_treatment_uuid: {
        type: DataTypes.INTEGER
      },
      comments: {
        type: DataTypes.STRING
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
        type: DataTypes.INTEGER
      },
      created_by: {
        type: DataTypes.INTEGER
      },
      modified_by: {
        type: DataTypes.INTEGER
      },
      tat_start_time: {
        type: DataTypes.DATE
      },
      tat_end_time: {
        type: DataTypes.DATE
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
  PATIENT_DIAGNOSIS.associate = model => {
    PATIENT_DIAGNOSIS.belongsTo(model.diagnosis, {
      foreignKey: "diagnosis_uuid"
    });
    PATIENT_DIAGNOSIS.belongsTo(model.encounter_type, {
      foreignKey: "encounter_type_uuid",
      as: "encounter_type"
    });
  };
  return PATIENT_DIAGNOSIS;
};
