const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

    const patient_certificates = sequelize.define(
        'patient_certificates',
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
            ward_master_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('ward_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('ward_master_uuid')
                    }
                }

            },
            admitted_date: {

                type: DataTypes.DATE,
                allowNull: true

            },
            admission_status_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('admission_status_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('admission_status_uuid')
                    }
                }
            },
            discharged_date: {

                type: DataTypes.DATE,
                allowNull: true

            },
            surgery_date: {

                type: DataTypes.DATE,
                allowNull: true

            },

            discharge_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('discharge_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('discharge_type_uuid')
                    }
                }

            },
            doctor_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('doctor_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('doctor_uuid')
                    },
                    min: {
                        args: 1,
                        msg: emr_constants.GetZeroValidationMessage('doctor_uuid')
                    },

                }


            },

            note_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('note_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('note_type_uuid')
                    },
                    min: {
                        args: 1,
                        msg: emr_constants.GetZeroValidationMessage('encounter_uuid')
                    }

                }


            },
            note_template_uuid: {

                type: DataTypes.INTEGER,
                // allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('note_template_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('note_template_uuid')
                //     },
                //     min: {
                //         args: 1,
                //         msg: emr_constants.GetZeroValidationMessage('encounter_uuid')
                //     }
                // }

            },
            certificate_status_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('certificate_status_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('certificate_status_uuid')
                    }

                }
            },
            released_to_patient: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('released_to_patient')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('released_to_patient')
                    }

                }
            },

            released_on: {

                type: DataTypes.DATE,
                allowNull: true

            },

            released_by: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            approved_on: {

                type: DataTypes.DATE,
                allowNull: true

            },
            certified_date: {

                type: DataTypes.DATE,
                allowNull: true

            },

            certified_by: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            aproved_by: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            data_template: {
                type: DataTypes.STRING,
                allowNull: true
            },
            status: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            is_emr_entry: { // field added by Manikanta 34442
                type: DataTypes.BOOLEAN,
                defaultValue: 0
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
            tableName: 'patient_certificates',
            createdAt: 'created_at',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ['uuid']
            }]
        }
    );
    patient_certificates.associate = models => {
        patient_certificates.belongsTo(models.note_templates, {
            foreignKey: 'note_template_uuid',
            targetKey: 'uuid'
        });
    }
    return patient_certificates;
};