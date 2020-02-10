//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const categories = sequelize.define(
        "categories",
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
            description: {

                type: DataTypes.STRING,
                allowNull: true

            },
            category_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            category_group_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

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
            tableName: "categories",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    categories.associate = models => {
        categories.hasMany(models.profile_section_categories, {
            foreignKey: 'category_uuid',
            as: 'profile_section_categories'
        });
    };

    return categories;
};