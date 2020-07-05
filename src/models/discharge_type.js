const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const discharge_type = sequelize.define(
        "discharge_type",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
            },
            revision: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
        },
        {
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            tableName: "discharge_type",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return discharge_type;
};