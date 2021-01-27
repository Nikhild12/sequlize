
module.exports = (sequelize, DataTypes) => {
    const vw_progress_notes = sequelize.define(
        "vw_progress_notes",
        {

            p_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            p_encounter_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_encounter_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_progressnote_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            p_captured_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_captured_on: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            p_daily_note: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            p_special_note: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            p_note_status_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_is_phr: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            p_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            p_status: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            p_revision: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            p_created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            p_created_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            p_modified_date: {
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
            tableName: "vw_progress_notes",
            timestamps: false
        }
    );

    return vw_progress_notes;
};