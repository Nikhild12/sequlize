const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const critical_care_charts = sequelize.define(
        "critical_care_charts",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            critical_care_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('critical_care_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('critical_care_type_uuid')
                    },
                    min: 0
                }
            },
            code: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            critical_care_uom_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('critical_care_uom_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('critical_care_uom_uuid')
                    },
                    min: 0
                }
            },
            mnemonic_code_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('mnemonic_code_master_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('mnemonic_code_master_uuid')
                //     },
                //     min: 0
                // }
            },
            loinc_code_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('loinc_code_master_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('loinc_code_master_uuid')
                //     },
                //     min: 0
                // }
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
            tableName: "critical_care_charts",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );
    // critical_care_charts.associate = models => {
    //     critical_care_charts.hasOne(models.critical_care_concepts, {
    //         foreignKey: "cc_chart_uuid",
    //         as: 'critical_care_concepts'
    //     });
    //     critical_care_charts.belongsTo(models.critical_care_types, {
    //         foreignKey: "critical_care_type_uuid",
    //         as: 'critical_care_types'
    //     });
    //     critical_care_charts.hasMany(models.critical_care_uoms, {
    //         foreignKey: "critical_care_uom_uuid",
    //         as: 'critical_care_uoms'
    //     });


    // };

    critical_care_charts.associate = models => {
        critical_care_charts.hasOne(models.critical_care_concepts, {
            foreignKey: "cc_chart_uuid",
            as: 'critical_care_concepts'
        });
        critical_care_charts.belongsTo(models.critical_care_types, {
            foreignKey: "critical_care_type_uuid",
           // as: 'critical_care_types'
        });
    };


    // critical_care_charts.associate = models => {
    //     critical_care_charts.hasOne(models.critical_care_concepts, {
    //         foreignKey: "cc_chart_uuid",
    //         as: 'critical_care_concepts'
    //     });
    // };
    // critical_care_charts.associate = models => {
    //     critical_care_charts.belongsTo(models.critical_care_types, {
    //         foreignKey: "critical_care_type_uuid",
    //         as: 'critical_care_types'
    //     });





    return critical_care_charts;
};