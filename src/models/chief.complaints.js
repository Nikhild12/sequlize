const emr_constants = require('../config/constants');
module.exports = (sequelize, DataTypes) => {

    const CHIEF_COMPLAINTS = sequelize.define("chief_complaints",
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
            chief_complaint_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_category_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_category_uuid')
                    },
                    min: 0
                }
            },
            comments: {
                type: DataTypes.TEXT
            },
            referrence_link: {
                type: DataTypes.STRING
            },
            body_site: {
                type: DataTypes.STRING
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
    CHIEF_COMPLAINTS.associate = models => {
        CHIEF_COMPLAINTS.belongsTo(models.chief_complaint_sections, {
            foreignKey: 'uuid',
            targetKey: 'chief_complaint_uuid'
        });

        // models.chief_complaint_sections.belongsTo(models.chief_complaint_section_concepts, {
        //     foreignKey: 'uuid',
        //     targetKey: 'chief_complaint_section_uuid'
        // });

        // models.chief_complaint_section_concepts.belongsTo(models.chief_complaint_section_concept_values, {
        //     foreignKey: 'uuid',
        //     targetKey: 'chief_complaint_section_concept_uuid'
        // })
    }

    return CHIEF_COMPLAINTS;
};