const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {

    const progress_notes = sequelize.define(
        'progress_notes',
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            encounter_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('encounter_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('encounter_uuid')
                //     },
                //     min: {
                //         args: 1,
                //         msg: emr_constants.GetMinimumMessage('encounter_uuid')
                //     }
                // }

            },
            encounter_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('encounter_type_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('encounter_type_uuid')
                //     },
                //     min: {
                //         args: 1,
                //         msg: emr_constants.GetMinimumMessage('encounter_type_uuid')
                //     }
                // }

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
            patient_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('patient_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('patient_uuid')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('patient_uuid')
                //     }
                // }

            },
            progressnote_type_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('progressnote_type_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('progressnote_type_uuid')
                //     },
                //     min: {
                //         args: 1,
                //         msg: emr_constants.GetMinimumMessage('progressnote_type_uuid')
                //     }
                // }

            },
            captured_on: {

                type: DataTypes.DATE,
                allowNull: true
            },
            captured_by: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('captured_by')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('captured_by')
                //     },
                //     min: {
                //         args: [1],
                //         msg: emr_constants.GetZeroValidationMessage('captured_by')
                //     }
                // }

            },
            daily_note: {

                type: DataTypes.STRING,
                allowNull: true,

            },
            special_note: {

                type: DataTypes.STRING,
                allowNull: true,

            },
            note_status_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                // validate: {
                //     notNull: {
                //         msg: emr_constants.GetpleaseProvideMsg('note_status_uuid')
                //     },
                //     notEmpty: {
                //         msg: emr_constants.GetpleaseProvideMsg('note_status_uuid')
                //     },
                //     min: {
                //         args: 1,
                //         msg: emr_constants.GetMinimumMessage('note_status_uuid')
                //     }
                // }

            },
            is_phr: {

                type: DataTypes.BOOLEAN,
                allowNull: true

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
            tableName: "progress_notes",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return progress_notes;
};