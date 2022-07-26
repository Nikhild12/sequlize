const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const diabetes_charts = sequelize.define(
        "diabetes_charts",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
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
                    min: 0
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
                    min: 0
                }
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
                    min: 0
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
                    min: 0
                }
            },
            from_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            to_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            cc_chart_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('cc_chart_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('cc_chart_uuid')
                    },
                    min: 0
                }
            },
            cc_concept_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('cc_concept_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('cc_concept_uuid')
                    },
                    min: 0
                }
            },
            cc_concept_value_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('cc_concept_value_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('cc_concept_value_uuid')
                    },
                    min: 0
                }
            },
            observed_value:{
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            comments: {
                type: DataTypes.STRING(225),
                allowNull: true
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                //allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                //allowNull: false
            },
            revision: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },

            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
        },
        {
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            tableName: "diabetes_charts",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    diabetes_charts.associate =  models => {
        diabetes_charts.belongsTo(models.critical_care_charts , {
            foreignKey:"cc_chart_uuid",
            as:'critical_care_charts'
        });
        diabetes_charts.belongsTo(models.critical_care_concepts , {
            foreignKey:"cc_concept_uuid",
            as:'critical_care_concepts'
        });
        diabetes_charts.belongsTo(models.critical_care_concept_values , {
            foreignKey:"cc_concept_value_uuid",
            as:'critical_care_concept_values'
        });
    };

    return diabetes_charts;
};