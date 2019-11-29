module.exports = (sequelize, DataTypes) => {
    const ENCOUNTER = sequelize.define(
        "encounter",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
            },
            encounter_type_uuid: {
                type: DataTypes.INTEGER,
            },
            encounter_identifier: {
                type: DataTypes.INTEGER,
            },
            patient_uuid: {
                type: DataTypes.INTEGER,
            },
            encounter_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            is_active_encounter: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            appointment_uuid: {
                type: DataTypes.INTEGER,
            },
            is_followup: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            encounter_status_uuid: {
                type: DataTypes.INTEGER,
            },
            admission_request_uuid: {
                type: DataTypes.INTEGER,
            },
            admission_uuid: {
                type: DataTypes.INTEGER,
            },
            discharge_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            discharge_type_uuid: {
                type: DataTypes.INTEGER,
            },
            encounter_priority_uuid: {
                type: DataTypes.INTEGER,
            },
            is_mrd_request: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            is_group_casuality: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            revision: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            created_by: {
                type: DataTypes.INTEGER,
            },
            modified_by: {
                type: DataTypes.INTEGER,
            }
        },
        {
            freezeTableName: true,
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    )
    ENCOUNTER.associate = model => {
        ENCOUNTER.hasMany(model.encounter_doctors, {
            foreignKey: "encounter_uuid"
        })
    }
    return ENCOUNTER;
}