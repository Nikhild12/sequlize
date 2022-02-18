module.exports = (sequelize, DataTypes) => {

    const examinations = sequelize.define("examinations",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING,
            },
            name: {
                type: DataTypes.STRING
            },
            description: {
                type: DataTypes.STRING
            },
            examination_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            examination_sub_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            comments: {
                type: DataTypes.TEXT
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
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notNull: true
                }

            },
            modified_by: {
                type: DataTypes.INTEGER,
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
            tableName: "examinations",
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

    examinations.associate = models => {
        examinations.hasMany(models.examination_sections, {
            foreignKey: 'examination_uuid',
            targetKey: 'examination_uuid'
        });
        models.examination_sections.hasMany(models.examination_section_values, {
            foreignKey: 'examination_section_uuid',
            targetKey: 'examination_section_uuid'
        });
    }

    return examinations;
};