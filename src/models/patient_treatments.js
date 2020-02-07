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
      encounter_type_uuid: {
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
  return PATIENT_TREATMENTS;
};
