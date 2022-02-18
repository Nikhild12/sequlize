module.exports = (sequelize, DataTypes) => {

    const history = sequelize.define("historys",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING,
            },
            name: {
                type: DataTypes.STRING
            },
            description: {
                type: DataTypes.STRING
            },
            history_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            history_sub_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            comments: {
                type: DataTypes.TEXT
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notNull: true
                }

            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notNull: true
                }

            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: true,

            },
            modified_date: {
                type: DataTypes.DATE,
                allowNull: true,

            }
        },
        {
            tableName: "historys",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            timestamps: false,
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );
    history.associate = models => {
        history.hasMany(models.history_sections, {
            foreignKey: 'history_uuid',
            targetKey: 'history_uuid'
        });
        models.history_sections.hasMany(models.history_section_values, {
            foreignKey: 'history_section_uuid',
            targetKey: 'history_section_uuid'
        });
    }

    return history;
};