const emr_constants = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const ENCOUNTER_DOCTOR = sequelize.define(
    "encounter_doctors",
    {
      uuid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_uuid: {
        type: DataTypes.INTEGER
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
          min: {
            args: 1,
            msg: emr_constants.GetMinimumMessage("doctor_uuid")
          }
        }
      },
      department_uuid: {
        type: DataTypes.INTEGER
      },
      encounter_uuid: {
        type: DataTypes.INTEGER
      },
      sub_deparment_uuid: {
        type: DataTypes.INTEGER
      },
      speciality_uuid: {
        type: DataTypes.INTEGER
      },
      dept_visit_type_uuid: {
        type: DataTypes.INTEGER
      },
      doctor_visit_type_uuid: {
        type: DataTypes.INTEGER
      },
      visit_type_uuid: {
        type: DataTypes.INTEGER
      },
      session_type_uuid: {
        type: DataTypes.INTEGER
      },
      consultation_start_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      token_number: {
        type: DataTypes.STRING(255)
      },
      is_primary_doctor: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      encounter_doctor_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
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
  ENCOUNTER_DOCTOR.associate = models => {
    ENCOUNTER_DOCTOR.belongsTo(models.favourite_type, {
      foreignKey: "uuid"
    });
  };
  return ENCOUNTER_DOCTOR;
};
