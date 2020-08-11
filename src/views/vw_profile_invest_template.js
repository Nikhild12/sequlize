module.exports = (sequelize, DataTypes) => {
    const vw_profile_invest_template = sequelize.define(
        "vw_profile_invest_template",
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
            tm_template_type_name :{
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            tm_department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_lab_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_is_public:{
                type: DataTypes.BOOLEAN
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
            itm_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            itm_code:{
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            itm_name:{
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            itm_description:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            itm_lab_master_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            itm_status:{
                type: DataTypes.BOOLEAN
            },
            itm_is_active:{
                type: DataTypes.BOOLEAN
            },
            ipm_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ipm_profile_code:{
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            ipm_name:{
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            ipm_description:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            ipm_lab_master_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ipm_status:{
                type: DataTypes.BOOLEAN
            },
            ipm_is_active:{
                type: DataTypes.BOOLEAN
            },
            tm_created_by: {
                type: DataTypes.INTEGER,
            },
            tm_created_date: {
                type: DataTypes.DATE,
            },
            tm_modified_by: {
                type: DataTypes.INTEGER,
            },
            tm_modified_date: {
                type: DataTypes.INTEGER,
            },
            f_uuid: {
                type: DataTypes.INTEGER,
            },
            f_name: {
                type: DataTypes.STRING(100)
            },
            d_uuid: {
                type: DataTypes.INTEGER,
            },
            d_name: {
                type: DataTypes.STRING(100)
            },
            uct_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            uc_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            uc_middle_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            uc_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            umt_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            um_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            um_middle_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            um_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            }
        },
        {
            tableName: "vw_profile_invest_template" ,
            timestamps: false
        }
        
    );
   
    return vw_profile_invest_template;
};