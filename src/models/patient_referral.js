const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

  const patient_referral = sequelize.define(
    'patient_referral',
    {
      uuid: {

        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,

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
      encounter_type_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
      referral_date: {

        type: DataTypes.DATE,
        allowNull: true

      },
      is_reviewed: {

        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false

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
          },

        }
      },
      comments: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      referral_type_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
      referral_facility_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
      referral_deptartment_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
      referral_comments: {
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
      tableName: 'patient_referral',
      createdAt: 'created_date',
      updatedAt: 'modified_date',
      indexes: [{
        fields: ['uuid']
      }]
    }
  );

  return patient_referral;
};