const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

  const patient_surgeries = sequelize.define(
    'patient_surgeries',
    {
      uuid: {

        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,

      },
      facility_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,

        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
          },
          min: {
            args: [0],
            msg: emr_constants.GetZeroValidationMessage('facility_uuid')
          },

        }
      },
      patient_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,

        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('patient_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('patient_uuid')
          },
          min: {
            args: [0],
            msg: emr_constants.GetZeroValidationMessage('patient_uuid')
          },

        }
      },

      encounter_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('encounter_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('encounter_uuid')
          },
          min: {
            args: [0],
            msg: emr_constants.GetZeroValidationMessage('encounter_uuid')
          }
        }
      },
      consultation_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
      procedure_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('procedure_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('procedure_uuid')
          },
          min: {
            args: [0],
            msg: emr_constants.GetZeroValidationMessage('procedure_uuid')
          }
        }
      },
      surgery_type_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0


      },

      surgery_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      surgery_description: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      performed_by: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },
      performed_date: {

        type: DataTypes.DATE,
        allowNull: true

      },
      comments: {
        type: DataTypes.STRING(500),
        allowNull: true
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
        defaultValue: 0,
        allowNull: false

      },

      created_by: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },

      modified_by: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
    },
    {
      tableName: 'patient_surgeries',
      createdAt: 'created_date',
      updatedAt: 'modified_date',
      indexes: [{
        fields: ['uuid']
      }]
    }
  );

  return patient_surgeries;
};