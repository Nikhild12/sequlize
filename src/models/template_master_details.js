const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const template_master_details = sequelize.define(
        "template_master_details",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            template_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('template_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('template_master_uuid')
                    },
                    min: 0
                }
            },
            chief_complaint_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    min: 0
                }
            },
            vital_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('vital_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('vital_master_uuid')
                    },
                    min: 0
                }
            },
            test_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('test_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('test_master_uuid')
                    },
                    min: 0
                }
            },
            diet_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('diet_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('diet_master_uuid')
                    },
                    min: 0
                }
            },
            diet_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
                
                
            },
            diet_frequency_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('diet_frequency_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('diet_frequency_uuid')
                    },
                    min: 0
                }
            },
            item_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('item_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('item_master_uuid')
                    },
                    min: 0
                }
            },
            chief_complaint_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    min: 0
                }
            },
            vital_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('vital_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('vital_master_uuid')
                    },
                    min: 0
                }
            },
            drug_route_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_route_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_route_uuid')
                    },
                    min: 0
                }
            },
            drug_frequency_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_frequency_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_frequency_uuid')
                    },
                    min: 0
                }
            },
            duration: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('duration')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('duration')
                    },
                    min: 0
                }
            },
            duration_period_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('duration_period_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('duration_period_uuid')
                    },
                    min: 0
                }
            },
            drug_instruction_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_instruction_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_instruction_uuid')
                    },
                    min: 0
                }
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('quantity')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('quantity')
                    },
                    min: 0
                }
            },
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('display_order')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('display_order')
                    },
                    min: 0
                }
            },
            comments: {
                type: DataTypes.STRING(500),
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
            tableName: "template_master_details",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    template_master_details.associate = models => {
        template_master_details.belongsTo(models.vital_masters, {
            foreignKey: "vital_master_uuid"
        });
    };
    

    return template_master_details;
};