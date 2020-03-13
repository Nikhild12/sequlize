const uuidparse = require ("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_emr_dashboard_details = sequelize.define(
        "vw_emr_dashboard_details",
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
            ed_is_active:{
                type: DataTypes.BOOLEAN,
            },
            ed_status:{
                type: DataTypes.BOOLEAN,
            },
            pd_uuid: {
                type: DataTypes.INTEGER,
            },
            pd_diagnosis_uuid: {
                type: DataTypes.INTEGER,
            },
            pd_other_diagnosis: {
                type: DataTypes.STRING(255)
            },
            pd_performed_date:{
                type: DataTypes.DATE,
            },
            pd_is_active:{
                type: DataTypes.BOOLEAN,
            },
            pd_status:{
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
            d_is_active:{
                type: DataTypes.BOOLEAN,
            },
            d_status:{
                type: DataTypes.BOOLEAN,
            },
            pcc_uuid: {
                type: DataTypes.INTEGER,
            },
            pcc_performed_date:{
                type: DataTypes.DATE,
            },
            pcc_chief_complaint_uuid: {
                type: DataTypes.INTEGER,
            },
            pcc_is_active:{
                type: DataTypes.BOOLEAN,
            },
            pcc_status:{
                type: DataTypes.BOOLEAN,
            },
            cc_uuid: {
                type: DataTypes.INTEGER,
            },
            cc_code: {
                type: DataTypes.STRING(50)
            },
            cc_name: {
                type: DataTypes.STRING(100)
            },
            cc_is_active: {
                type: DataTypes.BOOLEAN,
            },
            cc_status: {
                type: DataTypes.BOOLEAN,
            },
            p_uuid: {
                type: DataTypes.INTEGER,
            },
            p_gender_uuid:{
                type: DataTypes.INTEGER,
            },
            p_is_active:{
                type: DataTypes.BOOLEAN,
            },
            p_status:{
                type: DataTypes.BOOLEAN,
            },
            pv_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_session_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_registered_date:{
                type: DataTypes.DATE,
            },
            pv_is_active:{
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
            s_is_active:{
                type: DataTypes.BOOLEAN,
            },
            s_status:{
                type: DataTypes.BOOLEAN,
            },
            lpo_uuid: {
                type: DataTypes.INTEGER,
            },
            lpo_order_number: {
                type: DataTypes.INTEGER,
            },
            lpo_order_request_date:{
                type: DataTypes.DATE,
            },
            lpo_is_active:{
                type: DataTypes.BOOLEAN,
            },
            lpo_status:{
                type: DataTypes.BOOLEAN,
            },
            rpo_uuid: {
                type: DataTypes.INTEGER,
            },
            rpo_order_number: {
                type: DataTypes.INTEGER,
            },
            rpo_order_request_date:{
                type: DataTypes.DATE,
            },
            rpo_is_active:{
                type: DataTypes.BOOLEAN,
            },
            rpo_status:{
                type: DataTypes.BOOLEAN,
            },
            ipo_uuid: {
                type: DataTypes.INTEGER,
            },
            ipo_order_number: {
                type: DataTypes.INTEGER,
            },
            ipo_order_request_date:{
                type: DataTypes.DATE,
            },
            ipo_is_active:{
                type: DataTypes.BOOLEAN,
            },
            ipo_status:{
                type: DataTypes.BOOLEAN,
            },
            ps_uuid: {
                type: DataTypes.INTEGER,
            },
            ps_prescription_date:{
                type: DataTypes.DATE,
            },
            ps_is_active:{
                type: DataTypes.BOOLEAN,
            },
            ps_status:{
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
            g_is_active:{
                type: DataTypes.BOOLEAN,
            },
            g_status:{
                type: DataTypes.BOOLEAN,
            },
        },
        {
            timestamps: false
        }
    );
   
    return vw_emr_dashboard_details;
};