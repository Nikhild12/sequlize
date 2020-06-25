const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profile_sections = sequelize.define(
        "profile_sections",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            profile_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_uuid')
                    },
                    min: {
                        args: [1],
                        msg: emr_constants.GetZeroValidationMessage('profile_uuid')
                    }
                }

            },
            // section_uuid: {

            //     type: DataTypes.INTEGER,
            //     allowNull: false,
            //     validate: {
            //         notNull: {
            //             msg: emr_constants.GetpleaseProvideMsg('section_uuid')
            //         },
            //         notEmpty: {
            //             msg: emr_constants.GetpleaseProvideMsg('section_uuid')
            //         },
            //         min: {
            //             args: [1],
            //             msg: emr_constants.GetZeroValidationMessage('section_uuid')
            //         }
            //     }

            // },
            activity_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('activity_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('activity_uuid')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('activity_uuid')
                //     }
                // }


            },
            display_order: {

                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,

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
            tableName: "profile_sections",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );


    profile_sections.associate = models => {
        profile_sections.belongsTo(models.sections, {
            foreignKey: 'section_uuid',
            as: 'sections'
        });
        profile_sections.belongsTo(models.profiles, {
            foreignKey: 'profile_uuid',
            as: 'profiles'
        });
        profile_sections.hasMany(models.profile_section_categories, {
            foreignKey: 'profile_section_uuid',
            as: 'profile_section_categories'
        });
    };

    return profile_sections;
};