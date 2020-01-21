//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const concepts = sequelize.define(
        "concepts",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            code: {

                type: DataTypes.STRING,
                allowNull: false

            },
            name: {

                type: DataTypes.STRING,
                allowNull: false

            },
            description: {

                type: DataTypes.STRING,
                allowNull: true

            },
            value_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            is_multiple: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            is_mandatory : {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            display_order: {

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
            tableName: "concepts",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    concepts.associate = models => {
        concepts.hasMany(models.category_concepts, {
            foreignKey: 'concept_uuid',
            as: 'category_concepts'
        });
    };

    return concepts;
};