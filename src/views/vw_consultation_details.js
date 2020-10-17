module.exports = (sequelize, DataTypes) => {
    const vw_consultation_details = sequelize.define(
        "vw_consultation_details", {
            consultation_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            c_patient_uuid: {
                type: DataTypes.INTEGER
            },
            c_encounter_uuid: {
                type: DataTypes.INTEGER
            },
            c_doctor_uuid: {
                type: DataTypes.INTEGER
            },
            c_department_uuid: {
                type: DataTypes.INTEGER
            },
            created_date: {
                type: DataTypes.DATE
            },
            t_uuid: {
                type: DataTypes.INTEGER
            },
            t_name: {
                type: DataTypes.STRING
            },
            u_uuid: {
                type: DataTypes.INTEGER
            },
            u_first_name: {
                type: DataTypes.STRING(255)
            },
            u_middle_name: {
                type: DataTypes.STRING(255)
            },
            u_last_name: {
                type: DataTypes.STRING(255)
            },
            d_uuid: {
                type: DataTypes.INTEGER
            },
            d_name: {
                type: DataTypes.STRING
            },
            pt_uuid: {
                type: DataTypes.INTEGER
            },
            pt_name: {
                type: DataTypes.STRING
            },
            pa_first_name: {
                type: DataTypes.STRING(255)
            },
            pa_middle_name: {
                type: DataTypes.STRING(255)
            },
            pa_last_name: {
                type: DataTypes.STRING(255)
            },
            pa_age: {
                type: DataTypes.INTEGER
            },
            period_name: {
                type: DataTypes.STRING(255)
            },
            p_dob: {
                type: DataTypes.STRING
            },
            p_mobile: {
                type: DataTypes.STRING
            },
            g_name: {
                type: DataTypes.STRING(255)
            },
            pa_pin: {
                type: DataTypes.STRING(255)
            },
            pr_name: {
                type: DataTypes.STRING(255)
            }
        }, {
            freezeTableName: true
        }
    );
    return vw_consultation_details;
};