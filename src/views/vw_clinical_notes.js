
module.exports = (sequelize, DataTypes) => {
    const vw_clinical_notes = sequelize.define(
        "vw_clinical_notes",
        {
            c_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            c_facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            c_consultation_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_encounter_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_encounter_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_captured_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_captured_on: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            c_daily_note: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            c_special_note: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            c_note_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_note_status_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_ventilator: {
              type: DataTypes.BOOLEAN,
              allowNull: true
            },
            is_cpap: {
              type: DataTypes.BOOLEAN,
              allowNull: true
            },
            is_bipap: {
              type: DataTypes.BOOLEAN,
              allowNull: true
            },
            is_apap: {
              type: DataTypes.BOOLEAN,
              allowNull: true
            },
            is_o2_con: {
              type: DataTypes.BOOLEAN,
              allowNull: true
            },
            is_o2: {
              type: DataTypes.BOOLEAN,
              allowNull: true
            },
            c_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            c_status: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            c_revision: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            c_created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            c_created_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            c_modified_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            u_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            u_salutation_uuid: {
                type: DataTypes.INTEGER,
            },
            title_name: {
                type: DataTypes.STRING,
            },
            u_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_middle_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_gender_uuid:{
                type: DataTypes.INTEGER
            },
            gender_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_user_img_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_image_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            u_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            u_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            d_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            d_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            d_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            d_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            f_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            f_name: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            f_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            f_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            }
        },
        {
            tableName: "vw_clinical_notes",
            timestamps: false
        }
    );

    return vw_clinical_notes;
};