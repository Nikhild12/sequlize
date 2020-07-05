const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_emr_reference = sequelize.define(
        "vw_emr_reference",
        {

            uuid: {
                type: DataTypes.INTEGER(8).UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(8),
                allowNull: true,
                unique: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            table_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            database_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            activity_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            activity_code: {
                type: DataTypes.STRING,
            },
            activity_name: {
                type: DataTypes.STRING,
            },
            module_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
            },
            module_code: {
                type: DataTypes.STRING,
            },
            module_name: {
                type: DataTypes.STRING,
            },
            revision: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                defaultValue: 1,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            created_by: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            modified_by: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            modified_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            color: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: true
            },
            language: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: true
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
            tableName: "vw_emr_reference",
            timestamps: false
        }
    );

    return vw_emr_reference;
};