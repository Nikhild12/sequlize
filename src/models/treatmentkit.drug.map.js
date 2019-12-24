
const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const TREATMENT_kIT_DRUG = sequelize.define(
        'treatmentkit_drug_map',
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
            item_master_uuid: {

                type: DataTypes.INTEGER

            },
            drug_route_uuid: {

                type: DataTypes.INTEGER

            },
            drug_frequency_uuid: {

                type: DataTypes.INTEGER

            },
            duration: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            duration_period_uuid: {

                type: DataTypes.INTEGER

            },
            drug_instruction_uuid: {

                type: DataTypes.INTEGER

            },
            quantity: {

                type: DataTypes.STRING(255),
                allowNull: true

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
            created_by: {
                type: DataTypes.INTEGER
            },
            modified_by: {
                type: DataTypes.INTEGER
            },
            created_date: 'created_date',
            modified_date: 'modified_date'
        },
        {
            tableName: "treatmentkit_drug_map",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return TREATMENT_kIT_DRUG;
};