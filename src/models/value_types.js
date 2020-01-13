//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const value_types = sequelize.define(
        "value_types",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            code: {

                type: DataTypes.STRING,
                allowNull: true

            },
            name: {

                type: DataTypes.STRING,
                allowNull: true

            },
            color: {

                type: DataTypes.STRING,
                allowNull: true
                       
            },
            language: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            display_order: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            Is_default: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: true

            },
            is_active: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            status: {
                
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            revision: {
                
                type: DataTypes.INTEGER

            },
            created_by: {
                
                type: DataTypes.INTEGER

            },
            modified_by: {
                
                type: DataTypes.INTEGER

            },
            created_date: 'created_date',
            modified_date: 'modified_date',
        },
        {
            tableName: "value_types",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );
    
    return value_types;
};