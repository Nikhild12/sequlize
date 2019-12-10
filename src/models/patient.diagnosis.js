module.exports = (sequelize, DataTypes) => {

    const PATIENT_DIAGNOSIS = sequelize.define(

        "patient_diagnosis",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER
            },
            department_uuid: {
                type: DataTypes.INTEGER
            },
            patient_uuid: {
                type: DataTypes.INTEGER
            },
            encounter_uuid: {
                type: DataTypes.INTEGER
            },
            encounter_type_uuid: {
                type: DataTypes.INTEGER
            },
            consultation_uuid: {
                type: DataTypes.INTEGER
            },
            diagnosis_uuid: {
                type: DataTypes.INTEGER
            },
            other_diagnosis: {
                type: DataTypes.STRING
            },
            is_snomed: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            is_patient_condition: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            condition_type_uuid: {
                type: DataTypes.INTEGER
            },
            condition_date: {
                type: DataTypes.DATE
            },
            condition_status_uuid: {
                type: DataTypes.INTEGER
            },
            is_chronic: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            category_uuid: {
                type: DataTypes.INTEGER
            },
            type_uuid: {
                type: DataTypes.INTEGER
            },
            grade_uuid: {
                type: DataTypes.INTEGER
            },
            body_site_uuid: {
                type: DataTypes.INTEGER
            },
            performed_by: {
                type: DataTypes.INTEGER
            },
            performed_date: {
                type: DataTypes.DATE
            },
            prescription_uuid: {
                type: DataTypes.INTEGER
            },
            patient_treatment_uuid: {
                type: DataTypes.INTEGER
            },
            comments: {
                type: DataTypes.STRING
            },
            is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            revision: {
                type: DataTypes.INTEGER
            },
            created_by: {
                type: DataTypes.INTEGER
            },
            modified_by: {
                type: DataTypes.INTEGER
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
    );
    PATIENT_DIAGNOSIS.associate = model => {
        PATIENT_DIAGNOSIS.belongsTo(model.diagnosis, {
            foreignKey: "diagnosis_uuid"
        })
    }
    return PATIENT_DIAGNOSIS;
}