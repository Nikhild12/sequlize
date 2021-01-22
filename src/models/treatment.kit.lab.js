const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const TREATMENT_kIT_LAB_MAP = sequelize.define(
        'treatment_kit_lab_map',
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            treatment_kit_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            test_master_uuid: {

                type: DataTypes.INTEGER

            },
            profile_master_uuid: {

                type: DataTypes.INTEGER

            },
            quantity: {

                type: DataTypes.STRING(255),
                allowNull: true,
                defaultValue: 0

            },
            is_active: {

                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false

            },
            status: {

                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false

            },
            revision: {

                type: DataTypes.INTEGER

            },
            order_to_location_uuid: {

                type: DataTypes.INTEGER

            },

            order_priority_uuid: {
                type: DataTypes.INTEGER
            },
            comments: {
                type: DataTypes.STRING
            },
            created_date: 'created_date',
            modified_date: 'modified_date',
            created_by: {

                type: DataTypes.INTEGER

            },
            modified_by: {

                type: DataTypes.INTEGER

            }
        },
        {

            tableName: "treatment_kit_lab_map",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]

        }
    );
    return TREATMENT_kIT_LAB_MAP;
};