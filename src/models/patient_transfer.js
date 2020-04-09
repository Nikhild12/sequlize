const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

  const patient_transfer = sequelize.define(
    'patient_transfer',
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
            args: 1,
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
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('encounter_uuid')
          }
        }
      },
      encounter_type_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('encounter_type_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('encounter_type_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('encounter_type_uuid')
          }
        }

      },
      transfer_date: {

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
            args: 1,
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
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('department_uuid')
          },

        }
      },
      comments: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      transfer_type_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0

      },
      transfer_facility_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('transfer_facility_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('transfer_facility_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('transfer_facility_uuid')
          }

        }

      },
      transfer_department_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('transfer_department_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('transfer_department_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('transfer_department_uuid')
          }

        }
      },
      transfer_ward_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      transfer_reason_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('transfer_reason_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('transfer_reason_uuid')
          },
          min: {
            args: [0],
            msg: emr_constants.GetZeroValidationMessage('transfer_reason_uuid')
          }

        }
      },
      transfer_comments: {
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
      tableName: 'patient_transfer',
      createdAt: 'created_date',
      updatedAt: 'modified_date',
      indexes: [{
        fields: ['uuid']
      }]
    }
  );

  return patient_transfer;
};