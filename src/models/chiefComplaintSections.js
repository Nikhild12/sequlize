module.exports = function (sequelize, DataTypes) {
    const chief_complaint_section = sequelize.define("chief_complaint_sections",
        {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            chief_complaint_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false
            },
            section_name: {
                type: DataTypes.STRING(250),
                allowNull: true
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
    chief_complaint_section.associate = models => {
        chief_complaint_section.belongsTo(models.chief_complaint_section_concepts, {
            foreignKey: 'uuid',
            targetKey: 'chief_complaint_section_uuid'
        });
    }
    return chief_complaint_section;
};