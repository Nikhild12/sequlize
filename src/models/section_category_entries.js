const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const section_category_entries = sequelize.define(
        "section_category_entries",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            patient_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            encounter_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            encounter_doctor_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            consultation_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            profile_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            profile_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            section_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            section_key: {

                type: DataTypes.STRING,
                allowNull: true

            },
            activity_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            profile_section_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            category_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false
            },
            category_key: {

                type: DataTypes.STRING,
                allowNull: true

            },
            profile_section_category_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false
            },

            profile_section_category_concept_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false
            },
            concept_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            concept_key: {

                type: DataTypes.STRING,
                allowNull: true

            },
            term_key: {

                type: DataTypes.STRING,
                allowNull: true

            },

            profile_section_category_concept_value_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            result_value: {

                type: DataTypes.STRING,
                allowNull: true

            },
            result_value_rich_text: {

                type: DataTypes.STRING,
                allowNull: true

            },
            result_value_json: {

                type: DataTypes.STRING,
                allowNull: true

            },
            result_binary: {

                type: DataTypes.STRING,
                allowNull: true

            },
            result_path: {

                type: DataTypes.STRING,
                allowNull: true

            },
            entry_date: {

                type: DataTypes.STRING,
                allowNull: true

            },
            comments: {

                type: DataTypes.STRING,
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
            tableName: "section_category_entries",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ],
            defaultScope: {
                where: {
                    status: emr_constants.IS_ACTIVE
                }
            }
        }
    );

    // section_category_map.associate = models => {
    //     section_category_map.belongsTo(models.categories, {
    //         foreignKey: 'category_uuid',
    //         as: 'categories'
    //     });
    // };

    return section_category_entries;
};