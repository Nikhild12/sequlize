const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profile_section_category_concept_value_terms = sequelize.define(
        "profile_section_category_concept_value_terms",
        {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            profile_section_category_concept_values_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_section_category_concept_values_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_section_category_concept_values_uuid')
                    }
                }
            },
            concept_value_terms_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('concept_value_terms_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('concept_value_terms_uuid')
                    }
                }
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: 0
            },
            is_active: {
                type: DataTypes.BOOLEAN,
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
            tableName: "profile_section_category_concept_value_terms",
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
    profile_section_category_concept_value_terms.associate = models => {
        profile_section_category_concept_value_terms.belongsTo(models.concept_value_terms, {
            foreignKey: 'concept_value_terms_uuid'
        });
    };
    return profile_section_category_concept_value_terms;
};