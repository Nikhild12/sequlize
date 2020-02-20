

module.exports = (sequelize, DataTypes) => {
    const emr_reference_group = sequelize.define(
        "emr_reference_group",
        {
            uuid: {
                type: DataTypes.INTEGER(8).UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(8),
                allowNull: true,
                unique: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            table_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            database_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            activity_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            module_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            revision: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                defaultValue: 1,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            created_by: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: true
            },

            modified_by: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            modified_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            Is_default: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            color: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true
            },
            language: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: true
            }

        },
        {
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            tableName: "emr_reference_group",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return emr_reference_group;
};
