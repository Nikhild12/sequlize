const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const profiles = sequelize.define(
        "profiles",
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
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_type_uuid')
                    },
                    min: {
                        args: [1],
                        msg: emr_constants.GetZeroValidationMessage('profile_type_uuid')
                    }
                }

            },
            profile_code: {

                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_code')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_code')
                    }
                }

            },
            profile_name: {

                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_name')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('profile_name')
                    }
                }

            },
            profile_status: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            profile_description: {

                type: DataTypes.STRING,
                allowNull: true

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
                    min: {
                        args: [1],
                        msg: emr_constants.GetZeroValidationMessage('facility_uuid')
                    }
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
                    min: {
                        args: [1],
                        msg: emr_constants.GetZeroValidationMessage('department_uuid')
                    }
                }

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
            tableName: "profiles",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );


    profiles.associate = models => {
        profiles.hasMany(models.profile_sections, {
            foreignKey: 'profile_uuid',
            as: 'profile_sections'
        });
    };

    return profiles;
};