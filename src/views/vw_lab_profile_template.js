module.exports = (sequelize, DataTypes) => {
    const vw_lab_profile_template = sequelize.define(
        "vw_lab_profile_template",
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
            tm_is_public:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
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
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            tmd_status:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
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
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            tm_is_active:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            lpm_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            lpm_profile_code:{
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            lpm_name:{
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            lpm_description:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            lpm_lab_master_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            lpm_status:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            lpm_is_active:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            }
        },
        {
            tableName: "vw_lab_profile_template" ,
            timestamps: false
        }
        
    );
   
    return vw_lab_profile_template;
};