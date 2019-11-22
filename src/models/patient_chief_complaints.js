module.exports = (sequelize, DataTypes) => {
    const PATIENT_CHIEF_COMPLAINTS = sequelize.define(
        'patient_chief_complaints',
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            encounter_uuid: {
                type: DataTypes.INTEGER,
            },
            encounter_type_uuid: {
                type: DataTypes.INTEGER,
            },
            consultation_uuid: {
                type: DataTypes.INTEGER,
            },
            chief_complaint_uuid: {
                type: DataTypes.INTEGER,
            },
            chief_complaint_duration: {
                type: DataTypes.INTEGER,
            },
            chief_complaint_duration_period_uuid: {
                type: DataTypes.INTEGER,
            },
            start_date: {
                type: DataTypes.DATE,
            },
            end_date: {
                type: DataTypes.DATE,
            },
            performed_date: {
                type: DataTypes.DATE,
            },
            performed_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            comments: {
                type: DataTypes.STRING(255),
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

            }
        },
        {
            freezeTableName: true,
            timestamps: false,
            createAt: 'created_date',
            updatedAt: 'modified_date'
        }
    );

    return PATIENT_CHIEF_COMPLAINTS;
}