module.exports = function (sequelize, DataTypes) {
    const examination_section_concept = sequelize.define("examination_section_concepts",
        {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            concept_name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            examination_section_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            value_type_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            is_multiple: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0
            },
            is_mandatory: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0
            },
            display_order: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 1,
            },
            created_by: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notNull: true
                }
            },
            modified_by: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notNull: true
                }
            },
            created_date: {
                type: DataTypes.DATE,
                allowNull: true,

            },
            modified_date: {
                type: DataTypes.DATE,
                allowNull: true,

            }
        },
        {
            tableName: "examination_section_concepts",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            timestamps: false,
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );
    examination_section_concept.associate = models => {
        examination_section_concept.belongsTo(models.examination_section_concept_values, {
            foreignKey: 'uuid',
            targetKey: 'examination_section_concept_uuid'
        });
        examination_section_concept.belongsTo(models.value_types, {
            foreignKey: 'value_type_uuid',
            targetKey: 'uuid'
        });
    }
    return examination_section_concept;
};