module.exports = function (sequelize, DataTypes) {
    const patient_history = sequelize.define("patient_history",
        {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            department_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            patient_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            encounter_uuid: {
                type: DataTypes.INTEGER(11)
            },
            encounter_doctor_uuid: {
                type: DataTypes.INTEGER(11)
            },
            treatment_kit_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            patient_treatment_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            encounter_type_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            consultation_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            history_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            history_category_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            history_sub_category_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
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
        tableName: 'patient_history',
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
    return patient_history;
};