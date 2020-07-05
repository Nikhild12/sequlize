const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const critical_care_uoms = sequelize.define(
        "critical_care_uoms",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(225),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(225),
                allowNull: true
            },
            language: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            Is_default: {
                type: DataTypes.BOOLEAN
            },
            is_active: {
                type: DataTypes.BOOLEAN
            },
            status: {
                type: DataTypes.BOOLEAN
            },
            revision: {
                type: DataTypes.INTEGER
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
            tableName: "critical_care_uoms",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return critical_care_uoms;
};