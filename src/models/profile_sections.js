//const emr_constants = require('../config/constants');

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
                allowNull: false

            },
            section_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
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
    };

    return profile_sections;
};