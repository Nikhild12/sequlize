const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

    const patient_immunizations = sequelize.define(
        'patient_immunizations', {
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
                    },

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
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('consultation_uuid')
                    },

                }


            },
            immunization_schedule_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('immunization_schedule_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('immunization_schedule_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('immunization_schedule_uuid')
                    },

                }

            },
            schedule_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('schedule_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('schedule_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('schedule_uuid')
                    },

                }

            },
            immunization_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('immunization_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('immunization_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('immunization_uuid')
                    },

                }
            },
            schedule_flag_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,

            },
            route_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('route_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('route_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('route_uuid')
                    },

                }
            },
            dosage_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            immunization_date: {
                type: DataTypes.DATE,
                allowNull: false

            },
            administered_date: {
                type: DataTypes.DATE,
                allowNull: false

            },
            immunization_status_uuid: {

                type: DataTypes.INTEGER,

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
            comments: {

                type: DataTypes.STRING,
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
        }, {
            tableName: 'patient_immunizations',
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ['uuid']
            }]
        }
    );
    patient_immunizations.associate = model => {
        patient_immunizations.belongsTo(model.immunizations, {
            foreignKey: "immunization_uuid"
        });
        patient_immunizations.belongsTo(model.immunization_schedule, {
            foreignKey: "immunization_schedule_uuid"
        });
        patient_immunizations.belongsTo(model.schedules, {
            foreignKey: "schedule_uuid"
        });
        patient_immunizations.belongsTo(model.schedule_flags, {
            foreignKey: "schedule_flag_uuid"
        });
    };
    return patient_immunizations;
};