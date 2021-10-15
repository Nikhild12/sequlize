module.exports = function (sequelize, DataTypes) {
    const patient_chief_complaint_section = sequelize.define("patient_chief_complaint_sections",
        {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            patient_chief_complaint_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            chief_complaint_section_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            chief_complaint_section_name: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            value_type_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            value_type_name: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            comments: {
                type: DataTypes.STRING(255),
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
        tableName: 'patient_chief_complaint_sections',
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
    return patient_chief_complaint_section;
};