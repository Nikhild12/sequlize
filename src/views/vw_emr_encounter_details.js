module.exports = (sequelize, DataTypes) => {
    const vw_emr_encounter_details = sequelize.define(
        "vw_emr_encounter_details",
        {
            e_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            e_facility_uuid: {
                type: DataTypes.INTEGER
            },
            // f_uuid: {
            //     type: DataTypes.INTEGER
            // },
            f_code: {
                type: DataTypes.STRING(255)
            },
            f_name: {
                type: DataTypes.STRING(255)
            },
            f_is_active: {
                type: DataTypes.BOOLEAN
            },
            f_status: {
                type: DataTypes.BOOLEAN
            },
            e_department_uuid: {
                type: DataTypes.INTEGER
            },
            // d_uuid: {
            //     type: DataTypes.INTEGER
            // },
            d_code: {
                type: DataTypes.STRING(255)
            },
            d_short_code: {
                type: DataTypes.STRING(255)
            },
            d_name: {
                type: DataTypes.STRING(255)
            },
            d_is_active: {
                type: DataTypes.BOOLEAN
            },
            d_status: {
                type: DataTypes.BOOLEAN
            },
            e_patient_uuid: {
                type: DataTypes.INTEGER
            },
            // p_uuid: {
            //     type: DataTypes.INTEGER
            // },
            p_first_name: {
                type: DataTypes.STRING(255)
            },
            p_middle_name: {
                type: DataTypes.STRING(255)
            },
            p_last_name: {
                type: DataTypes.STRING(255)
            },
            p_uhid: {
                type: DataTypes.INTEGER
            },
            p_age: {
                type: DataTypes.BOOLEAN
            },
            p_is_adult: {
                type: DataTypes.BOOLEAN
            },
            p_dob: {
                type: DataTypes.DATE

            },
            p_registered_date: {
                type: DataTypes.DATE

            },
            p_is_active: {
                type: DataTypes.BOOLEAN
            },
            p_status: {
                type: DataTypes.BOOLEAN
            },
            e_encounter_type_uuid: {
                type: DataTypes.INTEGER
            },
            // et_uuid: {
            //     type: DataTypes.INTEGER
            // },
            et_code: {
                type: DataTypes.STRING(255)
            },
            et_name: {
                type: DataTypes.STRING(255)
            },
            et_is_active: {
                type: DataTypes.BOOLEAN
            },
            et_status: {
                type: DataTypes.BOOLEAN
            },
            e_encounter_priority_uuid: {
                type: DataTypes.INTEGER
            },
            e_encounter_identifier: {
                type: DataTypes.INTEGER
            },
            e_encounter_date: {
                type: DataTypes.DATE

            },
            e_is_active_encounter: {
                type: DataTypes.BOOLEAN
            },
            e_encounter_status_uuid: {
                type: DataTypes.INTEGER
            },
            e_appointment_uuid: {
                type: DataTypes.INTEGER
            },
            e_is_followup: {
                type: DataTypes.BOOLEAN
            },
            e_patient_referral_uuid: {
                type: DataTypes.INTEGER
            },
            e_patient_transfer_uuid: {
                type: DataTypes.INTEGER
            },
            e_admission_request_uuid: {
                type: DataTypes.INTEGER
            },
            e_admission_uuid: {
                type: DataTypes.INTEGER
            },
            e_is_mrd_request: {
                type: DataTypes.BOOLEAN
            },
            e_is_group_casuality: {
                type: DataTypes.BOOLEAN
            },
            e_discharge_type_uuid: {
                type: DataTypes.INTEGER
            },
            e_discharge_date: {
                type: DataTypes.DATE

            },
            e_is_active: {
                type: DataTypes.BOOLEAN
            },
            e_status: {
                type: DataTypes.BOOLEAN
            },
            ed_uuid: {
                type: DataTypes.INTEGER
            },
            ed_doctor_uuid: {
                type: DataTypes.INTEGER
            },
            u_uuid: {
                type: DataTypes.INTEGER
            },
            u_first_name: {
                type: DataTypes.STRING
            },
            u_middle_name: {
                type: DataTypes.STRING
            },
            u_last_name: {
                type: DataTypes.STRING
            },
            u_dob: {
                type: DataTypes.DATE
            },
            u_age: {
                type: DataTypes.INTEGER
            },
            u_gender_uuid: {
                type: DataTypes.INTEGER
            },
            is_active: {
                type: DataTypes.BOOLEAN
            },
            status: {
                type: DataTypes.BOOLEAN
            },
            ed_is_active: {
                type: DataTypes.BOOLEAN
            },
            ed_status: {
                type: DataTypes.BOOLEAN
            },

        },
        {
            freezeTableName: true
        }
    );

    return vw_emr_encounter_details;
};
