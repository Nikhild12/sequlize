module.exports = (sequelize, DataTypes) => {
  const PATIENT_CHIEF_COMPLAINTS = sequelize.define(
    "patient_chief_complaints", {
      uuid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
          notNull: true
        }
      },
      patient_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true
        }
      },
      encounter_uuid: {
        type: DataTypes.INTEGER
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
      chief_complaint_uuid: {
        type: DataTypes.INTEGER
      },
      chief_complaint_duration: {
        type: DataTypes.INTEGER
      },
      chief_complaint_duration_period_uuid: {
        type: DataTypes.INTEGER
      },
      start_date: {
        type: DataTypes.DATE
      },
      end_date: {
        type: DataTypes.DATE
      },
      performed_date: {
        type: DataTypes.DATE
      },
      performed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true
        }
      },
      comments: {
        type: DataTypes.STRING(255)
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
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
        allowNull: false,
        validate: {
          notNull: true
        }
      },
      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true
        }
      },
      tat_start_time: {
        type: DataTypes.DATE
      },
      tat_end_time: {
        type: DataTypes.DATE
      }
    }, {
      freezeTableName: true,
      timestamps: false,
      createAt: "created_date",
      updatedAt: "modified_date"
    }
  );
  PATIENT_CHIEF_COMPLAINTS.associate = model => {
    PATIENT_CHIEF_COMPLAINTS.belongsTo(model.chief_complaints, {
      foreignKey: "chief_complaint_uuid"
    });
    PATIENT_CHIEF_COMPLAINTS.belongsTo(model.chief_complaint_duration_periods, {
      foreignKey: "chief_complaint_duration_period_uuid"
    });
    PATIENT_CHIEF_COMPLAINTS.belongsTo(model.encounter, {
      foreignKey: "encounter_uuid"
    });
    PATIENT_CHIEF_COMPLAINTS.belongsTo(model.encounter_type, {
      foreignKey: "encounter_type_uuid",
      as: "encounter_type"
    });
  };
  return PATIENT_CHIEF_COMPLAINTS;
};