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
      consultation_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      referred_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      referred_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      comments: {
        type: DataTypes.STRING(500),
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
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('referral_facility_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('referral_facility_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('referral_facility_uuid')
          },
        }
      },
      referral_deptartment_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('referral_deptartment_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('referral_deptartment_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('referral_deptartment_uuid')
          },
        }
      },
      referal_reason: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      is_reviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
        allowNull: false
      },
      is_admitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
        allowNull: false
      },
      ward_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      referral_comments: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      admission_request_uuid: { /*H30-46971Adding new columns in patient referral table (admission_request_uuid) By Elumalai-*/
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      //H30-48488 Bhaskar - 28th Mar 22 - API Change for Community Name Added in Patient Referral//
      community_name: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      //H30-48488 Bhaskar - 28th Mar 22 - API Change for Community Name Added in Patient Referral//
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