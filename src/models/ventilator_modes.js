const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const ventilator_modes = sequelize.define(
        "ventilator_modes",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(8),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                //allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                //allowNull: false
            },
            revision: {
                type: DataTypes.INTEGER,
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
            tableName: "ventilator_modes",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return ventilator_modes;
};