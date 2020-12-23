
const emr_constants = require('../config/constants');
module.exports = (sequelize, DataTypes) => {

    const TREATMENT_KIT_RADIOLOGY_MAP = sequelize.define(
        'treatment_kit_radiology_map',
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
                defaultValue: 1,
                allowNull: false

            },
            status: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            revision: {

                type: DataTypes.INTEGER,
                allowNull: true

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
            created_by: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            modified_by: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            created_date: 'created_date',
            modified_date: 'modified_date'
        }, {
        tableName: "treatment_kit_radiology_map",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [
            {
                fields: ["uuid"]
            }
        ],
        defaultScope: {
            where: {
                status: emr_constants.IS_ACTIVE
            }
        }
    }
    );
    return TREATMENT_KIT_RADIOLOGY_MAP;
};