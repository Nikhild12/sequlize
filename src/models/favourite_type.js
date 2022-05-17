
const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const favourite_type = sequelize.define(
        "favourite_type", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns
            code: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
           
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
           
           
            revision: {
                type: DataTypes.STRING,
                allowNull: false
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
           
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
           
        }, {
            tableName: "favourite_type",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    favourite_type.associate = models => {
    favourite_type.hasMany(models.favourite_master, {
        foreignKey: "favourite_type_uuid"
      });
    };

    return favourite_type;
};