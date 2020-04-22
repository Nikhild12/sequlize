const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_emr_immunizations = sequelize.define(
        "vw_emr_immunizations",
        {

            i_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            i_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            i_description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            i_route_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_frequency_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_duration: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_period_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_instruction: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            i_schedule_flag_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            i_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            i_revision: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            i_created_date: {
                type: DataTypes.DATE
            },
            i_modified_date: {
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
            df_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            df_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            df_name: {
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
            tableName: "vw_emr_immunizations",
            timestamps: false
        }
    );

    return vw_emr_immunizations;
};