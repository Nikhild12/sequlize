const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_patient_certificate = sequelize.define(
        "vw_patient_certificate",
        {

            u_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            u_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            u_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_middle_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true

            },
            pc_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pc_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            pc_patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pc_note_template_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pc_facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pc_doctor_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pc_department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pc_certified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pc_data_template: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            pc_approved_on: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            pc_aproved_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            nt_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            nt_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            nt_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            certified_name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            nt_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false

            }
        },
        {
            tableName: "vw_patient_certificate",
            timestamps: false
        }
    );

    return vw_patient_certificate;
};