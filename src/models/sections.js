const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const sections = sequelize.define(
        "sections",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            section_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('section_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('section_type_uuid')
                    }
                }

            },
            section_note_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('section_note_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('section_note_type_uuid')
                    }
                }

            },
            name: {

                type: DataTypes.STRING,
                allowNull: true

            },
            description: {

                type: DataTypes.STRING,
                allowNull: true

            },
            sref: {

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
            tableName: "sections",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    sections.associate = models => {
        sections.hasMany(models.profile_sections, {
            foreignKey: 'section_uuid',
            as: 'profile_sections'
        });
    };

    return sections;
};