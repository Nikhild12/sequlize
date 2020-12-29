const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_emr_diagnosis_dashboard_count = sequelize.define(
        "vw_emr_diagnosis_dashboard_count",
        {
            ed_patient_uuid: {
                type: DataTypes.INTEGER,
            },
            ed_doctor_uuid: {
                type: DataTypes.INTEGER,
            },
            ed_department_uuid: {
                type: DataTypes.INTEGER,
            },
            ed_consultation_start_date: {
                type: DataTypes.DATE,
            },
            ed_is_active: {
                type: DataTypes.BOOLEAN,
            },
            ed_status: {
                type: DataTypes.BOOLEAN,
            },
            pd_uuid: {
                type: DataTypes.INTEGER,
            },
            pd_diagnosis_uuid: {
                type: DataTypes.INTEGER,
            },
            pd_facility_uuid: {
                type: DataTypes.INTEGER,
            },
            pd_department_uuid: {
                type: DataTypes.INTEGER,
            }, pd_created_by: {
                type: DataTypes.INTEGER,
            },
            pd_other_diagnosis: {
                type: DataTypes.STRING(255)
            },
            pd_performed_date: {
                type: DataTypes.DATE,
            },
            pd_is_active: {
                type: DataTypes.BOOLEAN,
            },
            pd_status: {
                type: DataTypes.BOOLEAN,
            },
            d_uuid: {
                type: DataTypes.INTEGER,
            },
            d_code: {
                type: DataTypes.STRING(50)
            },
            d_name: {
                type: DataTypes.STRING(100)
            },
            d_is_active: {
                type: DataTypes.BOOLEAN,
            },
            d_status: {
                type: DataTypes.BOOLEAN,
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
            tableName: "vw_emr_diagnosis_dashboard_count",
            timestamps: false
        }
    );

    return vw_emr_diagnosis_dashboard_count;
};