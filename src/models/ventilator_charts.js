const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const ventilator_charts = sequelize.define(
        "ventilator_charts",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('template_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('template_master_uuid')
                    },
                    min: 0
                }
            },
            encounter_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('chief_complaint_uuid')
                    },
                    min: 0
                }
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('vital_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('vital_master_uuid')
                    },
                    min: 0
                }
            },
            encounter_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('test_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('test_master_uuid')
                    },
                    min: 0
                }
            },
            ventilator_mode_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('item_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('item_master_uuid')
                    },
                    min: 0
                }
            },
            
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                //allowNull: false
            },
            revision: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },

            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
        },
        {
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            tableName: "ventilator_charts",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return ventilator_charts;
};