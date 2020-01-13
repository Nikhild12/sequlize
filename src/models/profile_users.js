//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profile_users = sequelize.define(
        "profile_users",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            profile_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            facility_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            department_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            user_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            visittype_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            is_default: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            is_active: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: true

            },
            status: {
                
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: true

            },
            revision: {
                
                type: DataTypes.INTEGER,
                allowNull: true


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
            tableName: "profile_users",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );
    
    return profile_users;
};