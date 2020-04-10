module.exports = (sequelize, DataTypes) => {
    const vw_patient_vitals = sequelize.define(
        "vw_patient_vitals",
        {
            vm_name: {
                type: DataTypes.STRING(100),
            },
            vm_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            vm_status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            um_code: {
                type: DataTypes.STRING(50),
            },
            um_name: {
                type: DataTypes.STRING(50),
            },
            um_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            um_status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            pv_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            pv_facility_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_department_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_patient_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_encounter_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_encounter_type_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_doctor_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_consultation_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_vital_group_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_vital_type_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_vital_master_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_vital_qualifier_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_vital_value_type_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_vital_value: {
                type: DataTypes.STRING(50),
            },
            pv_vital_uom_uuid: {
                type: DataTypes.INTEGER,
            },
            pv_performed_date: {
                type: DataTypes.DATE,
            },
            pv_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            pv_status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            pv_created_date: {
                type: DataTypes.DATE,
            },
            d_name: {
                type: DataTypes.STRING(100),
            },
            ut_name:{
                type: DataTypes.STRING(255),
            },
            u_first_name: {
                type: DataTypes.STRING(255),
            },
            u_middle_name: {
                type: DataTypes.STRING(255),
            },
            u_last_name: {
                type: DataTypes.STRING(255),
            },
            et_code: {
                type: DataTypes.STRING(8),
            },
            et_name: {
                type: DataTypes.STRING(255),
            },
            f_uuid: {
                type: DataTypes.INTEGER,
            },
            f_name: {
                type: DataTypes.STRING(100),
            },
            f_is_active: {
                type: DataTypes.BOOLEAN,

            },
            f_status: {
                type: DataTypes.BOOLEAN,

            }

        },
        {
            freezeTableName: true,
        }
    );

    return vw_patient_vitals;
};