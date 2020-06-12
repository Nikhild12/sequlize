const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profiles_default = sequelize.define(
        "profiles_default",
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            profile_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('profile_type_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('profile_type_uuid')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('profile_type_uuid')
                //     }
                // }

            },
            profile_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('profile_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('profile_uuid')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('profile_uuid')
                //     }
                // }

            },
            user_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('user_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('user_uuid')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('user_uuid')
                //     }
                // }

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
                defaultValue: 1,
                allowNull: false

            },
            created_by: {

                type: DataTypes.INTEGER

            },
            modified_by: {

                type: DataTypes.INTEGER

            },
            created_date: 'created_date',
            modified_date: 'modified_date',
        },
        {
            tableName: "profiles_default",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return profiles_default;
};