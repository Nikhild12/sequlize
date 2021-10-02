module.exports = function (sequelize, DataTypes) {
    const chief_complaint_section_concept_value = sequelize.define("chief_complaint_section_concept_values",
        {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            chief_complaint_section_concept_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            value_name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            display_order: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            is_default: {
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
    return chief_complaint_section_concept_value;
};