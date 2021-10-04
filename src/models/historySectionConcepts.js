module.exports = function (sequelize, DataTypes) {
    const history_section_concept = sequelize.define("history_section_concepts",
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
            history_section_uuid: {
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
    history_section_concept.associate = models => {
        history_section_concept.belongsTo(models.history_section_concept_values, {
            foreignKey: 'uuid',
            targetKey: 'history_section_concept_uuid'
        });
    }
    return history_section_concept;
};