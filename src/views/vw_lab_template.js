module.exports = (sequelize, DataTypes) => {
    const vw_lab_template = sequelize.define(
        "vw_lab_template",
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
            ltm_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ltm_code:{
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            ltm_name:{
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            ltm_description:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            ltm_lab_master_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ltm_status:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            ltm_is_active:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            }
        },
        {
            tableName: "vw_lab_template" ,
            timestamps: false
        }
        
    );
   
    return vw_lab_template;
};