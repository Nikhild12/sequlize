const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

  const family_history = sequelize.define(
    'family_history',
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
      consultation_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('consultation_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('consultation_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('consultation_uuid')
          }
        }

      },
      relation_type_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('relation_type_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('relation_type_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('relation_type_uuid')
          }
        }

      },
      disease_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      disease_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      disease_description: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      identified_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }

      },

      duration: {

        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false

      },
      period_uuid: {

        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: emr_constants.GetpleaseProvideMsg('period_uuid')
          },
          notEmpty: {
            msg: emr_constants.GetpleaseProvideMsg('period_uuid')
          },
          min: {
            args: 1,
            msg: emr_constants.GetZeroValidationMessage('period_uuid')
          }
        }

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
      tableName: 'family_history',
      createdAt: 'created_date',
      updatedAt: 'modified_date',
      indexes: [{
        fields: ['uuid']
      }]
    }
  );

  family_history.associate = models => {
    family_history.belongsTo(models.periods, {
      foreignKey: 'period_uuid',
      as: 'periods'
    });
    family_history.belongsTo(models.family_relation_type, {
      foreignKey: 'relation_type_uuid',
      as: 'family_relation_type'
    });
  };


  return family_history;
};