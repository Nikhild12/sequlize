const emr_constants = require("../config/constants");
module.exports = (sequelize, DataTypes) => {
  const patient_vitals = sequelize.define(
    "patient_vitals",
    {
      uuid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
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
          min: 0
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
          min: 0
        }
      },
      doctor_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("doctor_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("doctor_uuid")
          },
          min: 0
        }
      },
      consultation_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("consultation_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("consultation_uuid")
          },
          min: 0
        }
      },
      performed_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      vital_group_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("vital_group_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("vital_group_uuid")
          },
          min: 0
        }
      },
      vital_type_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("vital_type_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("vital_type_uuid")
          },
          min: 0
        }
      },
      vital_master_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("vital_master_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("vital_master_uuid")
          },
          min: 0
        }
      },
      mnemonic_code: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      loinc_code: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      vital_qualifier_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("vital_qualifier_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("vital_qualifier_uuid")
          },
          min: 0
        }
      },
      vital_value_type_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("vital_value_type_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("vital_value_type_uuid")
          },
          min: 0
        }
      },
      vital_value: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      vital_uom_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg("vital_uom_uuid")
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("vital_uom_uuid")
          },
          min: 0
        }
      },
      reference_range_from: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      reference_range_to: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      patient_vital_status_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg(
              "facpatient_vital_status_uuidility_uuid"
            )
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg("patient_vital_status_uuid")
          },
          min: 0
        }
      },
      comments: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: "1",
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: "1",
        allowNull: false
      },
      revision: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      tat_start_time: {
        type: DataTypes.DATE
      },
      tat_end_time: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: "patient_vitals",
      createdAt: "created_date",
      updatedAt: "modified_date",
      indexes: [
        {
          fields: ["uuid"]
        }
      ]
    }
  );
  return patient_vitals;
};
