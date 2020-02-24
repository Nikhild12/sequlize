const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_treatment_kit = sequelize.define(
        "vw_treatment_kit",
        {

            u_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            u_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            u_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_middle_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true

            },
            tk_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tk_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            tk_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tk_is_public: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            tk_code: {
                type: DataTypes.STRING,
                allowNull: true
            },
            tk_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false

            },
            d_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            d_name: {
                type: DataTypes.STRING(500),
                allowNull: true,
            }
        },
        {
            tableName: "vw_treatment_kit",
            timestamps: false
        }
    );

    return vw_treatment_kit;
};