//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const category_concept_values = sequelize.define(
        "category_concept_values",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            value_code: {

                type: DataTypes.STRING,
                allowNull: true

            },
            value_name: {

                type: DataTypes.STRING,
                allowNull: true

            },
            category_concept_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

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
            tableName: "category_concept_values",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );


    category_concept_values.associate = models => {
        category_concept_values.belongsTo(models.category_concepts, {
            foreignKey: 'category_concept_uuid',
            as: 'category_concepts'
        });
    };
    return category_concept_values;
};