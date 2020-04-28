
const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const immunizations = sequelize.define(
        "immunizations", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        route_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
            
        },
        frequency_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
           
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
            
        },
        period_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            
        },
        instruction: {
            type: DataTypes.STRING(250),
            allowNull: false
            
        },
        schedule_flag_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        revision: {
            type: DataTypes.STRING,
            defaultValue: 1
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
        tableName: "immunizations",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );

    return immunizations;
};