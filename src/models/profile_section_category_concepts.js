const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profile_section_category_concepts = sequelize.define(
        "profile_section_category_concepts",
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

            profile_section_category_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_section_category_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_section_category_uuid')
                    },
                    min: {
                        args: [1],
                        msg: emr_constants.GetZeroValidationMessage('profile_section_category_uuid')
                    }
                }



            },
            // value_type_uuid: {

            //     type: DataTypes.INTEGER,
            //     allowNull: false,
            //     validate: {
            //         notNull: {
            //             msg: emr_constants.GetpleaseProvideMsg('value_type_uuid')
            //         },
            //         notEmpty: {
            //             msg: emr_constants.GetpleaseProvideMsg('value_type_uuid')
            //         },
            //         min: {
            //             args: [1],
            //             msg: emr_constants.GetZeroValidationMessage('value_type_uuid')
            //         }
            //     }

            // },
            is_multiple: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            is_mandatory: {

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
            tableName: "profile_section_category_concepts",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );


    profile_section_category_concepts.associate = models => {
        profile_section_category_concepts.belongsTo(models.profile_section_categories, {
            foreignKey: 'profile_section_category_uuid',
            as: 'profile_section_categories'
        });
    };

    profile_section_category_concepts.associate = models => {
        profile_section_category_concepts.hasMany(models.profile_section_category_concept_values, {
            foreignKey: 'profile_section_category_concept_uuid',
            as: 'profile_section_category_concept_values'
        });
        profile_section_category_concepts.belongsTo(models.value_types, {
            foreignKey: 'value_type_uuid',
            as: 'value_types'
        });
    };


    return profile_section_category_concepts;
};

