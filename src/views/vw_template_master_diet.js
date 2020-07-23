const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_template_master_diet = sequelize.define(
        "vw_template_master_diet",
        {
            tm_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            tm_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            tm_dept: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_userid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_template_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tm_template_type_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            tm_status: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            tm_active: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            tm_public: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            tm_description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            tm_display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tmd_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tmd_diet_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tmd_diet_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            tmd_diet_frequency_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            tmd_is_active: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            tmd_status: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: ["0", "1"]
            },
            tmd_display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            dm_code: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            dm_name: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            df_code: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            df_name: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            dc_code: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            dc_name: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            tmd_quantity: {
                type: DataTypes.INTEGER
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
            },
            dm_status: {
                type: DataTypes.BOOLEAN
            },
            dm_is_active: {
                type: DataTypes.BOOLEAN
            }
        },
        {
            tableName: "vw_template_master_diet",
            timestamps: false
        }
    );

    return vw_template_master_diet;
};