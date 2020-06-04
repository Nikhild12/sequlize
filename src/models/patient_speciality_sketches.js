const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const patient_speciality_sketches = sequelize.define(
        "patient_speciality_sketches", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
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
                    args: [1],
                    msg: emr_constants.GetZeroValidationMessage('facility_uuid')
                }
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
                    args: [1],
                    msg: emr_constants.GetZeroValidationMessage('department_uuid')
                }
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
                    args: [1],
                    msg: emr_constants.GetZeroValidationMessage('patient_uuid')
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
                    args: [1],
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
                    args: [1],
                    msg: emr_constants.GetZeroValidationMessage('encounter_type_uuid')
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
                    args: [1],
                    msg: emr_constants.GetZeroValidationMessage('doctor_uuid')
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
                    args: [1],
                    msg: emr_constants.GetZeroValidationMessage('consultation_uuid')
                }
            }

        },
        speciality_sketch_uuid: {

            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: emr_constants.GetpleaseProvideMsg('speciality_sketch_uuid')
                },
                notEmpty: {
                    msg: emr_constants.GetpleaseProvideMsg('speciality_sketch_uuid')
                },
                min: {
                    args: [1],
                    msg: emr_constants.GetZeroValidationMessage('speciality_sketch_uuid')
                }
            }

        },
        sketch_path: {
            type: DataTypes.STRING,
            allowNull: true
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        revision: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    }, {
        tableName: "patient_speciality_sketches",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );
    patient_speciality_sketches.associate = model => {
        patient_speciality_sketches.belongsTo(model.speciality_sketches, {
            foreignKey: "speciality_sketch_uuid"
        });
    };
    return patient_speciality_sketches;
};