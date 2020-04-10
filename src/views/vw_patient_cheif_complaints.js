module.exports = (sequelize, DataTypes) => {
    const vw_patient_cheif_complaints = sequelize.define(
        "vw_patient_cheif_complaints",
        {
            cc_code:{
                type: DataTypes.STRING(50)                
            },
            cc_name:{
                type: DataTypes.STRING(255)
            },
            cc_description:{
                type: DataTypes.STRING(255)
            },
            cc_is_active:{
                type: DataTypes.BOOLEAN
            },
            cc_status:{
                type: DataTypes.BOOLEAN
            },
            ccdp_code:{
                type: DataTypes.STRING(50)
            },
            ccdp_name:{
                type: DataTypes.STRING(100)
            },
            ccdp_is_active:{
                type: DataTypes.BOOLEAN
            },
            ccdp_status:{
                type: DataTypes.BOOLEAN
            },
            pcc_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            pcc_facility_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_department_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_patient_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_encounter_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_encounter_type_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_encounter_doctor_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_consultation_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_chief_complaint_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_chief_complaint_duration:{
                type: DataTypes.INTEGER
            },
            pcc_chief_complaint_duration_period_uuid:{
                type: DataTypes.INTEGER
            },
            pcc_start_date:{
                type:DataTypes.DATE
            },
            pcc_end_date:{
                type:DataTypes.DATE
            },
            pcc_performed_date:{
                type:DataTypes.DATE
            },
            pcc_performed_by:{
                type: DataTypes.INTEGER
            },
            pcc_comments:{
                type: DataTypes.STRING(255)
            },
            pcc_is_active:{
                type: DataTypes.BOOLEAN
            },
            pcc_status:{
                type: DataTypes.BOOLEAN
            },
            pcc_created_date:{
                type:DataTypes.DATE
            },
            pcc_created_by:{
                type: DataTypes.INTEGER
            },
            pcc_modified_by:{
                type: DataTypes.INTEGER
            },
            u_uuid:{
                type: DataTypes.INTEGER
            },
            et_code:{
                type: DataTypes.STRING(8)
            },
            et_name:{
                type: DataTypes.STRING(255)
            },
            ut_name:{
                type: DataTypes.STRING(255)
            },
            u_first_name:{
                type: DataTypes.STRING(255)
            },
            u_last_name:{
                type: DataTypes.STRING(255)
            },
            u_middle_name:{
                type: DataTypes.STRING(255)
            },
            u_user_name:{
                type: DataTypes.STRING(255)
            },
            u_gender_uuid:{
                type: DataTypes.INTEGER
            },
            u_age:{
                type: DataTypes.INTEGER
            },
            d_uuid:{
                type: DataTypes.INTEGER
            },
            d_name:{
                type: DataTypes.STRING(100)
            },
            d_is_active:{
                type: DataTypes.BOOLEAN
            },
            d_status:{
                type: DataTypes.BOOLEAN
            },
            f_uuid:{
                type: DataTypes.INTEGER
            },
            f_name:{
                type: DataTypes.STRING(100)
            },
            f_is_active:{
                type: DataTypes.BOOLEAN
            },
            f_status:{
                type: DataTypes.BOOLEAN
            }            
        },
        {
            freezeTableName: true,
            timestamps:false
        }
    );

    return vw_patient_cheif_complaints;
};