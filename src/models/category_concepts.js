//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const category_concepts = sequelize.define(
        "category_concepts",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            category_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            concept_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            display_order: {

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
            tableName: "category_concepts",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );
    
    return category_concepts;
};