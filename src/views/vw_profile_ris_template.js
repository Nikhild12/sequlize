module.exports = (sequelize, DataTypes) => {
    const vw_profile_ris_template = sequelize.define(
        "vw_profile_ris_template",
        {
            tm_uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            tm_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            tm_user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_template_type_uuid :{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tmd_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tmd_display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tmd_active:{
                type: DataTypes.BOOLEAN
            },
            tmd_status:{
                type: DataTypes.BOOLEAN
            },
            tm_description:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            tm_display_order:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tmd_test_master_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_status:{
                type: DataTypes.BOOLEAN
            },
            tm_is_active:{
                type: DataTypes.BOOLEAN
            },
            tm_is_public:{
                type: DataTypes.BOOLEAN
            },
            rtm_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rtm_code:{
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            rtm_name:{
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            rtm_description:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            rtm_lab_master_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rtm_status:{
                type: DataTypes.BOOLEAN
            },
            rtm_is_active:{
                type: DataTypes.BOOLEAN
            },
            rpm_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rpm_profile_code:{
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            rpm_name:{
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            rpm_description:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            rpm_lab_master_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rpm_status:{
                type: DataTypes.BOOLEAN
            },
            rpm_is_active:{
                type: DataTypes.BOOLEAN
            }
        },
        {
            tableName: "vw_profile_ris_template" ,
            timestamps: false
        }
        
    );
   
    return vw_profile_ris_template;
};