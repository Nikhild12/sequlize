const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const immunization_schedule = sequelize.define(
        "immunization_schedule", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        schedule_uuid: {
            type: DataTypes.STRING(250),
            allowNull: false,
            validate: {
                notNull: {
                    msg: emr_constants.GetpleaseProvideMsg('schedule_uuid')
                },
                notEmpty: {
                    msg: emr_constants.GetpleaseProvideMsg('schedule_uuid')
                }
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
                }
            }
        },
       
        immunization_schedule_flag_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
           
        },
        immunization_route_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
            
        },
        duration:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        immunization_dosage_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
            // validate: {
            //     notNull: {
            //         msg: emr_constants.GetpleaseProvideMsg('immunization_dosage_uuid')
            //     },
            //     notEmpty: {
            //         msg: emr_constants.GetpleaseProvideMsg('immunization_dosage_uuid')
            //     },
            //     min: {
            //         args: 1,
            //         msg: emr_constants.GetMinimumMessage('immunization_dosage_uuid')
            //     }
            // }
        },
        duration_period_uuid: {
           type: DataTypes.INTEGER,
            allowNull: true
        },
        
        display_order: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        revision: {
            type: DataTypes.STRING,
            defaultValue: 1
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
            allowNull: true,
            defaultValue: 0
        },

    }, {
        tableName: "immunization_schedule",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );
    immunization_schedule.associate = models => {
        immunization_schedule.belongsTo(models.immunizations, {
            foreignKey: "immunization_uuid"
        });
        immunization_schedule.belongsTo(models.schedules, {
            foreignKey: "schedule_uuid"
        });
       
    };

    return immunization_schedule;
};