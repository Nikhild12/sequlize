//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profile_section_category_concept_values = sequelize.define(
        "profile_section_category_concept_values",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            profile_section_category_concept_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            value_code: {

                type: DataTypes.STRING,
                allowNull: true

            },
            value_name: {

                type: DataTypes.STRING,
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
            tableName: "profile_section_category_concept_values",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return profile_section_category_concept_values;
};

