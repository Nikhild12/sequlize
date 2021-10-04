module.exports = function (sequelize, DataTypes) {
    const history_sub_category = sequelize.define("history_sub_category",
        {
            uuid: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(50),
            },
            name: {
                type: DataTypes.STRING(100)
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
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 1,
            },
            created_by: {
                type: DataTypes.INTEGER(11),
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
            modified_by: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notNull: true
                }
            },
            modified_date: {
                type: DataTypes.DATE,
                allowNull: true,

            }
        },
        {
            tableName: "history_sub_category",
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
    history_sub_category.associate = models => {
        history_sub_category.belongsTo(models.historys, {
            foreignKey: 'uuid',
            targetKey: 'history_sub_category_uuid'
        });
    }
    return history_sub_category;
};