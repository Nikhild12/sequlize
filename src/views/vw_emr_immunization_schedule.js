const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_emr_immunization_schedule = sequelize.define(
        "vw_emr_immunization_schedule",
        {

            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            schedule_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            schedule_name:{
                type: DataTypes.STRING
            },
            immunization_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            immunization_name:{
                type: DataTypes.STRING
            },
            immunization_schedule_flag_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            immunization_route_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            duration: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            immunization_dosage_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            duration_period_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            created_date: {
                type: DataTypes.DATE
            },
            modified_date: {
                type: DataTypes.DATE
            },
            dr_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            dr_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            dr_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
           
            dp_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            dp_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            dp_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            do_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            do_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            do_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            sf_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            sf_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            sf_name: {
                type: DataTypes.STRING,
                allowNull: true,
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
            tableName: "vw_emr_immunization_schedule",
            timestamps: false
        }
    );
    vw_emr_immunization_schedule.associate = models => {
        vw_emr_immunization_schedule.belongsTo(models.immunizations, {
            foreignKey: "immunization_uuid"
        });
        vw_emr_immunization_schedule.belongsTo(models.schedules, {
            foreignKey: "schedule_uuid"
        });
       
    };
    return vw_emr_immunization_schedule;
};