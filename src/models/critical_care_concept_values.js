//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const concepts = sequelize.define(
        "critical_care_concept_values",
        {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            cc_concept_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            // cc_chart_uuid: {

            //     type: DataTypes.INTEGER,
            //     allowNull: true
            // },
            concept_value: {

                type: DataTypes.STRING,
                allowNull: false

            },
            value_from: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            value_to: {

                type: DataTypes.INTEGER,
                allowNull: true
            },
            display_order: {

                type: DataTypes.INTEGER,
                allowNull: false
            },
            // is_multiple: {

            //     type: DataTypes.BOOLEAN,
            //     defaultValue: 1,
            //     allowNull: false

            // },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
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
            tableName: "critical_care_concept_values",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    // concepts.associate = models => {
    //     concepts.hasMany(models.category_concepts, {
    //         foreignKey: 'concept_uuid',
    //         as: 'critical_care_concept_values'
    //     });
    // };

    return concepts;
};