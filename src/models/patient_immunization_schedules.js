const emr_constants = require('../config/constants');


module.exports = (sequelize, DataTypes) => {

    const patient_immunization_schedules = sequelize.define(
        'patient_immunization_schedules',
        {
            uuid: {

                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,

            },
            patient_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true,

            },

            encounter_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            consultation_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true


            },
            immunization_schedule_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true


            },
            schedule_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true,

            },
            immunization_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true
            },
            immunization_schedule_flag_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },

            immunization_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            route_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true
            },
            immunization_dosage_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            duration: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            immunization_date: {
                type: DataTypes.DATE,
                allowNull: false

            },
            administered_date: {
                type: DataTypes.DATE,
                allowNull: false

            },
            display_order: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },
            immunization_schedule_status_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            facility_uuid: {

                type: DataTypes.INTEGER,
                allowNull: true

            },
            comments: {

                type: DataTypes.STRING,
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
                defaultValue: 0,
                allowNull: false

            },

            created_by: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },

            modified_by: {

                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0

            },
        },
        {
            tableName: 'patient_immunization_schedules',
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ['uuid']
            }]
        }
    );



    return patient_immunization_schedules;
};