//const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const concepts = sequelize.define(
        "critical_care_concepts",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            cc_chart_uuid:{

                type: DataTypes.INTEGER,
                allowNull: true
            },
            concept_code: {

                type: DataTypes.STRING,
                allowNull: false

            },
            concept_name: {

                type: DataTypes.STRING,
                allowNull: false

            },
            value_type_uuid:{

                type: DataTypes.INTEGER,
                allowNull: true
            },
            is_multiple: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            is_default:{
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
            tableName: "critical_care_concepts",
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