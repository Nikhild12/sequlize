const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {

    const EMR_HISTORY_SETTINGS = sequelize.define(
        'emr_history_settings',
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
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
                    min: 0
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
                    min: 0
                }
            },
            role_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('role_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('role_uuid')
                    },
                    min: 0
                }
            },
            user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true,
                    min: 0
                }
            },
            context_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('context_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('context_uuid')
                    },
                    min: 0
                }
            },
            activity_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('activity_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('activity_uuid')
                    },
                    min: 0
                }
            },
            context_activity_map_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('context_activity_map_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('context_activity_map_uuid')
                    },
                    min: 0
                }
            },
            history_view_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('history_view_order')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('history_view_order')
                    },
                    min: 0
                }
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false,
            },
            revision: {
                type: DataTypes.INTEGER
            },
            created_by: {
                type: DataTypes.INTEGER,
            },
            modified_by: {
                type: DataTypes.INTEGER
            },
            created_date: 'created_date',
            modified_date: 'modified_date',
        },
        {
            tableName: "emr_history_settings",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    )

    return EMR_HISTORY_SETTINGS;
}