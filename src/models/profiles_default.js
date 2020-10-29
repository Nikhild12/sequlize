const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profiles_default = sequelize.define(
        "profiles_default",
        {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            profile_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            profile_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
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
                type: DataTypes.INTEGER,
                defaultValue: 1,
                allowNull: false
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
            tableName: "profiles_default",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return profiles_default;
};