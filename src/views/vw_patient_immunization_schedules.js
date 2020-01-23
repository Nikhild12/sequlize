module.exports = (sequelize, DataTypes) => {
    const vw_patient_immunization_schedules = sequelize.define(
        'vw_patient_immunization_schedules',
        {

            f_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            f_name: {

                type: DataTypes.STRING

            },
            f_is_active: {

                type: DataTypes.BOOLEAN

            },
            f_status: {

                type: DataTypes.BOOLEAN

            },
            pis_uuid: {

                type: DataTypes.INTEGER

            },
            pis_immunization_name: {

                type: DataTypes.STRING

            },
            pis_immunization_date: {

                type: DataTypes.STRING

            },

            pis_is_active: {

                type: DataTypes.BOOLEAN

            },
            pis_status: {

                type: DataTypes.BOOLEAN

            },
            pis_comments: {

                type: DataTypes.STRING

            },
            et_name: {

                type: DataTypes.STRING

            },
            et_is_active: {

                type: DataTypes.BOOLEAN

            },
            et_status: {

                type: DataTypes.BOOLEAN

            },
            pis_encounter_uuid: {

                type: DataTypes.INTEGER

            },
            pis_consultation_uuid: {

                type: DataTypes.INTEGER

            },
            pis_patient_uuid: {

                type: DataTypes.INTEGER

            },
            pis_immunization_schedule_uuid: {

                type: DataTypes.INTEGER

            },
            pis_schedule_uuid: {

                type: DataTypes.INTEGER

            },
            pis_immunization_schedule_flag_uuid: {

                type: DataTypes.INTEGER

            },
            pis_route_uuid: {

                type: DataTypes.INTEGER

            },
            pis_immunization_dosage_uuid: {

                type: DataTypes.INTEGER

            },
            pis_duration: {

                type: DataTypes.STRING

            },
            pis_immunization_period_uuid: {

                type: DataTypes.INTEGER

            },

            pis_immunization_schedule_status_uuid: {

                type: DataTypes.INTEGER

            },
            pis_display_order: {

                type: DataTypes.STRING

            },

        },
        {
            freezeTableName: true
        }
    );
    return vw_patient_immunization_schedules;
};
