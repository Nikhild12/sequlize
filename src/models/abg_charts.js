const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const abg_charts = sequelize.define(
        "abg_charts",
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
                type: DataTypes.DECIMAL(16,2),
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
            tableName: "abg_charts",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    abg_charts.associate =  models => {
        abg_charts.belongsTo(models.critical_care_charts , {
            foreignKey:"cc_chart_uuid",
            as:'critical_care_charts'
        });
        
    };

    return abg_charts;
};