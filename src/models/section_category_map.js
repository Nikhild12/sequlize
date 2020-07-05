//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const section_category_map = sequelize.define(
        "section_category_map",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            section_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            category_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            display_order: {

                type: DataTypes.INTEGER,
                allowNull: false

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
            tableName: "section_category_map",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    section_category_map.associate = models => {
        section_category_map.belongsTo(models.categories, {
            foreignKey: 'category_uuid',
            as: 'categories'
        });
    };

    return section_category_map;
};