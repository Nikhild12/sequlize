module.exports = function (sequelize, DataTypes) {
    const patient_history_section_value = sequelize.define("patient_history_section_values",
        {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            patient_history_section_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            history_section_value_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            history_section_value_name: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            comments: {
                type: DataTypes.STRING(500),
                allowNull: true
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
            modified_by: {
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
            modified_date: {
                type: DataTypes.DATE,
                allowNull: true,

            }
        }, {
        tableName: 'patient_history_section_values',
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
    return patient_history_section_value;
};