
const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const TREATMENT_kIT_DRUG = sequelize.define(
        'treatment_kit_drug_map',
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

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('item_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('item_master_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('item_master_uuid')
                    }
                }

            },
            store_master_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            drug_route_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_route_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_route_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('drug_route_uuid')
                    }
                }

            },
            drug_frequency_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_frequency_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_frequency_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('drug_frequency_uuid')
                    }
                }

            },
            dosage: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            duration: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            duration_period_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('duration_period_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('duration_period_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('duration_period_uuid')
                    }
                }

            },
            drug_instruction_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_instruction_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('drug_instruction_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('drug_instruction_uuid')
                    }
                }

            },
            quantity: {

                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('quantity')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('quantity')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('quantity')
                    }
                }

            },
            comments: {
                type: DataTypes.STRING
            },
            strength: {
                type: DataTypes.STRING(255)
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
            modified_date: 'modified_date'
        },
        {
            tableName: "treatment_kit_drug_map",
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