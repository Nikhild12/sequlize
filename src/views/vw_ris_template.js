module.exports = (sequelize, DataTypes) => {
    const vw_ris_template = sequelize.define(
        "vw_ris_template",
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
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            rtm_is_active:{
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            }
        },
        {
            tableName: "vw_ris_template" ,
            timestamps: false
        }
        
    );
   
    return vw_ris_template;
};