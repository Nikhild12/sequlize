
module.exports = (sequelize, DataTypes) => {

    const TICK_SHEET_MASTER_DETAILS = sequelize.define(
        "favourite_master_details",
        {
            uuid: {

                type: DataTypes.INTEGER,
                // allowNull : false,
                primaryKey: true,
                autoIncrement: true,
            },
            favourite_master_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }

            },
            test_master_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true,
                    min: 0
                }
            },

            test_master_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }

            },
            item_master_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }

            },
            chief_complaint_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            vital_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            diagnosis_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            drug_route_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },

            drug_frequency_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },

            },
            duration: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            duration_period_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },

            },
            treatment_kit_uuid: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            drug_instruction_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }

            },
            quantity: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            group_code: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            group_name: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            display_order: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            comments: {

                type: DataTypes.STRING(255),
                allowNull: true

            },

            is_active: {

                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"

            },

            status: {

                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"

            },

            revision: {

                type: DataTypes.STRING,
                allowNull: false

            },

            created_date: 'created_date',
            modified_date: 'modified_date',

            created_by: {

                type: DataTypes.INTEGER,
                allowNull: false

            },

            modified_by: {

                type: DataTypes.INTEGER,
                allowNull: false,

            }

        },
        {
            freezeTableName: true,
            timestamps: false,
            createAt: 'created_date',
            updatedAt: 'modified_date'
        }
    );

    return TICK_SHEET_MASTER_DETAILS;

};