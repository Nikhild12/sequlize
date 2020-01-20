const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

    const patient_allergies = sequelize.define(
        'patient_allergies',
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
            consultation_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,


            },
            allergy_master_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('allergy_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('allergy_master_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('allergy_master_uuid')
                    }
                }
            },

            allergy_type_uuid: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            symptom: {

                type: DataTypes.STRING(500),
                allowNull: true

            },
            allergy_adr_status_uuid: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            allergy_adr_score_uuid: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            start_date: {

                type: DataTypes.DATE,
                allowNull: true

            },
            end_date: {

                type: DataTypes.DATE,
                allowNull: true

            },
            allergy_severity_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('allergy_severity_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('allergy_severity_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('allergy_severity_uuid')
                    }
                }

            },

            allergy_source_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('allergy_source_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('allergy_source_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('allergy_source_uuid')
                    }
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
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('period_uuid')
                    }
                }

            },
            comments: {

                type: DataTypes.STRING(2000),
                allowNull: true

            },
            performed_date: {

                type: DataTypes.DATE,
                allowNull: true

            },
            performed_by: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            patient_allergy_status_uuid: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

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
            tableName: 'patient_allergies',
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ['uuid']
            }]
        }
    );

    patient_allergies.associate = models => {
        patient_allergies.belongsTo(models.encounter, {
            foreignKey: 'encounter_uuid',
            as: 'encounter'
        });

        patient_allergies.belongsTo(models.allergy_source, {
            foreignKey: 'allergy_source_uuid'
        });

        patient_allergies.belongsTo(models.allergy_severity, {
            foreignKey: 'allergy_severity_uuid',
            as: 'allergy_severity'
        });

        patient_allergies.belongsTo(models.allergy_masters, {
            foreignKey: 'allergy_master_uuid',
            as: 'allergy_masters'
        });

        patient_allergies.belongsTo(models.periods, {
            foreignKey: 'period_uuid',
            as: 'periods'
        });


    };

    return patient_allergies;
};