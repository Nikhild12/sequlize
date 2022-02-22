module.exports = function (sequelize, DataTypes) {
    const examination_section = sequelize.define("examination_sections",
        {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            examination_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            section_name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            value_type_uuid: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            display_order: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            is_mandatory: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0
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
            tableName: "examination_sections",
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
    // examination_section.associate = models => {
    //     examination_section.belongsTo(models.examination_section_concepts, {
    //         foreignKey: 'uuid',
    //         targetKey: 'examination_section_uuid'
    //     });
    // }
    return examination_section;
};