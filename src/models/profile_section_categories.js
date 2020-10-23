const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profile_section_categories = sequelize.define(
        "profile_section_categories",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            profile_section_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_section_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_section_uuid')
                    },
                }

            },
            // category_uuid: {

            //     type: DataTypes.INTEGER,
            //     allowNull: false,
            //     validate: {
            //         notNull: {
            //             msg: emr_constants.GetpleaseProvideMsg('category_uuid')
            //         },
            //         notEmpty: {
            //             msg: emr_constants.GetpleaseProvideMsg('category_uuid')
            //         },
            //     }


            // },
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
            tableName: "profile_section_categories",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ],
            defaultScope: {
                where: {
                    status: 1
                }
            }
        }
    );

    profile_section_categories.associate = models => {
        profile_section_categories.belongsTo(models.categories, {
            foreignKey: 'category_uuid',
            as: 'categories'
        });
        profile_section_categories.belongsTo(models.profile_sections, {
            foreignKey: 'profile_section_uuid',
            as: 'profile_sections'
        });
        profile_section_categories.hasMany(models.profile_section_category_concepts, {
            foreignKey: 'profile_section_category_uuid',
            as: 'profile_section_category_concepts'
        });
    };

    return profile_section_categories;
};