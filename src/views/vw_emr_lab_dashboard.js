const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_emr_lab_dashboard = sequelize.define(
        "vw_emr_lab_dashboard",
        {
            po_facility_uuid: {
                type: DataTypes.INTEGER,
            },
            po_doctor_uuid: {
                type: DataTypes.INTEGER,
            },
            po_department_uuid: {
                type: DataTypes.INTEGER,
            },
            po_status: {
                type: DataTypes.BOOLEAN
            },
            po_is_active: {
                type: DataTypes.BOOLEAN
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
            lpo_uuid: {
                type: DataTypes.INTEGER,
            },
            lpo_order_number: {
                type: DataTypes.INTEGER,
            },
            lpo_order_request_date: {
                type: DataTypes.DATE,
            },
            lpo_is_active: {
                type: DataTypes.BOOLEAN,
            },
            lpo_status: {
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
            tableName: "vw_emr_lab_dashboard",
            timestamps: false
        }
    );

    return vw_emr_lab_dashboard;
};