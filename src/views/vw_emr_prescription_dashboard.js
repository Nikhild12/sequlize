const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_emr_prescription_dashboard = sequelize.define(
        "vw_emr_prescription_dashboard",
        {
            ps_patient_uuid: {
                type: DataTypes.INTEGER,
            },
            ps_doctor_uuid: {
                type: DataTypes.INTEGER,
            },
            ps_department_uuid: {
                type: DataTypes.INTEGER,
            },
            ps_facility_uuid: {
                type: DataTypes.INTEGER,
            },
            ed_consultation_start_date: {
                type: DataTypes.DATE,
            },
            p_uuid: {
                type: DataTypes.INTEGER,
            },
            p_gender_uuid: {
                type: DataTypes.INTEGER,
            },
            p_is_active: {
                type: DataTypes.BOOLEAN,
            },
            p_status: {
                type: DataTypes.BOOLEAN,
            },
            pv_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_session_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_registered_date: {
                type: DataTypes.DATE,
            },
            pv_is_active: {
                type: DataTypes.BOOLEAN,
            },
            s_uuid: {
                type: DataTypes.INTEGER,
            },
            s_code: {
                type: DataTypes.STRING(50)
            },
            s_name: {
                type: DataTypes.STRING(100)
            },
            s_is_active: {
                type: DataTypes.BOOLEAN,
            },
            s_status: {
                type: DataTypes.BOOLEAN,
            },
            ps_uuid: {
                type: DataTypes.INTEGER,
            },
            ps_prescription_date: {
                type: DataTypes.DATE,
            },
            ps_is_active: {
                type: DataTypes.BOOLEAN,
            },
            ps_status: {
                type: DataTypes.BOOLEAN,
            },
            g_uuid: {
                type: DataTypes.INTEGER,
            },
            g_code: {
                type: DataTypes.STRING(50)
            },
            g_name: {
                type: DataTypes.STRING(100)
            },
            g_is_active: {
                type: DataTypes.BOOLEAN,
            },
            g_status: {
                type: DataTypes.BOOLEAN,
            },
        },
        {
            tableName: "vw_emr_prescription_dashboard",
            timestamps: false
        }
    );

    return vw_emr_prescription_dashboard;
};