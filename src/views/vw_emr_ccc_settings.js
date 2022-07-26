module.exports = (sequelize, DataTypes) => {
    const VM_EMR_CCC_SETTING = sequelize.define(
        "vw_emr_ccc_settings",
        {
            ecs_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            ecs_facility_uuid: {
                type: DataTypes.INTEGER
            },
            ecs_department_uuid: {
                type: DataTypes.INTEGER
            },
            ecs_user_uuid: {
                type: DataTypes.INTEGER
            },
            ecs_cc_type_uuid: {
                type: DataTypes.INTEGER
            },
            ecs_is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            ecs_created_by: {
                type: DataTypes.INTEGER
            },
            ecs_created_date: 'created_date',
            ecs_modified_date: 'modified_date',

            ecs_modified_by: {
                type: DataTypes.INTEGER
            },
            cc_type_code: {
                type: DataTypes.STRING(255)
            },
            cc_type_name: {
                type: DataTypes.STRING(255)
            }
        },
        {
            freezeTableName: true,

        }
    );

    return VM_EMR_CCC_SETTING;
};