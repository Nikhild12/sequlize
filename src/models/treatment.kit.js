const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {

    const TREATMENT_KIT = sequelize.define(
        'treatment_kit',
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            treatment_kit_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('treatment_kit_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('treatment_kit_type_uuid')
                    },
                    min: {
                        args: 1,
                        msg: emr_constants.GetMinimumMessage('treatment_kit_type_uuid')
                    }
                }

            },
            code: {

                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('code')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('code')
                    }
                }

            },
            name: {

                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('name')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('name')
                    }
                }

            },
            description: {
                type: DataTypes.STRING
            },
            share_uuid: {
                type: DataTypes.INTEGER
            },
            is_public: {

                type: DataTypes.BOOLEAN

            },
            facility_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('facility_uuid')
                //     }
                // }

            },
            department_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('department_uuid')
                //     }
                // }

            },
            user_uuid: {

                type: DataTypes.INTEGER

            },
            activefrom: {

                type: DataTypes.DATE,
                allowNull: false,
                notNull: {
                    msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                },
                notEmpty: {
                    msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                }

            },
            activeto: {

                type: DataTypes.DATE,
                allowNull: true

            },
            comments: {

                type: DataTypes.STRING

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

                type: DataTypes.INTEGER

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
            tableName: "treatment_kit",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return TREATMENT_KIT;
};