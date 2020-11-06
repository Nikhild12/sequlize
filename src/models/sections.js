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
                defaultValue: 0
            },
            section_note_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false
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
                type: DataTypes.BOOLEAN
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: 1,
            },
            revision: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
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
            ],
            defaultScope: {
                where: {
                    status: 1
                }
            }
        }
    );

    sections.associate = models => {
        sections.hasMany(models.profile_sections, {
            foreignKey: 'section_uuid',
            as: 'profile_sections'
        });
        sections.belongsTo(models.section_note_types, {
            foreignKey: 'section_note_type_uuid'
        });
        sections.belongsTo(models.section_types, {
            foreignKey: 'section_type_uuid'
        });
    };

    return sections;
};