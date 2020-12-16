const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {

    const emr_ccc_settings= sequelize.define(
        'emr_ccc_settings',
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
                    },
                    min: 0
                }
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                    },
                    min: 0
                }
            },
            user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true,
                    min: 0
                }
            },
            critical_care_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false,
            },
            revision: {
                type: DataTypes.INTEGER
            },
            created_by: {
                type: DataTypes.INTEGER,
            },
            modified_by: {
                type: DataTypes.INTEGER
            },
            created_date: 'created_date',
            modified_date: 'modified_date',
        },
        {
            tableName: "emr_ccc_settings",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return emr_ccc_settings
};