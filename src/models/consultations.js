const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const consultations = sequelize.define(
        "consultations",
        {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            encounter_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            encounter_doctor_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            doctor_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            profile_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            profile_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            visible_user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            visible_dept_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            visittype_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            approved_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            claim_process_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            last_consult_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            ot_register_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            restrict_reason: {
                type: DataTypes.STRING,
                allowNull: true
            },
            reference_no: {
                type: DataTypes.STRING,
                allowNull: true
            },
            claim_number: {
                type: DataTypes.STRING,
                allowNull: true
            },
            last_consult_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false
            },
            status: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            revision: {

                type: DataTypes.INTEGER

            },
            created_by: {

                type: DataTypes.INTEGER

            },
            modified_by: {

                type: DataTypes.INTEGER

            },
            created_date: 'created_date',
            modified_date: 'modified_date',
        },
        {
            tableName: "consultations",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    consultations.associate = models => {
        consultations.hasMany(models.section_category_entries, {
            foreignKey: 'consultation_uuid'
        });
        consultations.hasOne(models.vw_my_patient_list, {
            foreignKey: 'patient_uuid'
        });
        consultations.hasOne(models.vw_patient_doctor_details, {
            foreignKey: 'ed_doctor_uuid',
            targetKey: 'doctor_uuid'
        });
    };

    return consultations;
};