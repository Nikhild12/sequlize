const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

    const TREATMENT_KIT_CHIEFCOMPLAINT_MAP = sequelize.define(
        'treatment_kit_chief_complaint_map', {
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
            chief_complaint_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    min: {
                        args: [0],
                        msg: emr_constants.GetZeroValidationMessage('chief_complaint_uuid')
                    }
                }

            },
            quantity: {
                type: DataTypes.STRING(255),
                allowNull: true,
                defaultValue: 0
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
            modified_date: 'modified_date'
        }, {
            tableName: "treatment_kit_chief_complaint_map",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }],
            defaultScope: {
                where: {
                    status: emr_constants.IS_ACTIVE
                }
            }
        }
    );

    return TREATMENT_KIT_CHIEFCOMPLAINT_MAP;

};