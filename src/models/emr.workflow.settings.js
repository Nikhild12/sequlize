module.exports = (sequelize, DataTypes) => {

    const EMR_WORKFLOW_SETTINGS = sequelize.define(
        "emr_workflow_settings",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            role_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            context_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            context_activity_map_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            activity_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            work_flow_order: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",

            },
            status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            created_date: 'created_date',
            modified_date: 'modified_date',

            created_by: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            modified_by: {

                type: DataTypes.INTEGER,
                allowNull: false

            }
        },
        {
            freezeTableName: true,
            timestamps: false,
            createAt: 'created_date',
            updatedAt: 'modified_date'
        }
    );

    return EMR_WORKFLOW_SETTINGS;
}