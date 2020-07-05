// nt_uuid, nt_code, nt_name, nt_note_template_type_uuid, nt_note_type_uuid,
//     nt_facility_uuid, nt_department_uuid, nt_data_template, nt_is_default, nt_is_active,
//     nt_status, nt_revision, nt_created_by, nt_modified_by, nt_created_date,
//     nt_modified_date, ntt_uuid, ntt_name, ntt_is_active, ntt_status, nty_uuid,
//     nty_name, nty_is_active, nty_status, d_uuid, d_name,
//     d_is_active, d_status,

//     f_uuid, f_name, f_is_active, f_status



module.exports = (sequelize, DataTypes) => {
    const vw_note_template = sequelize.define(
        'vw_note_template',
        {
            nt_uuid: {
                type: DataTypes.INTEGER,
            },
            nt_code: {
                type: DataTypes.STRING(255),
            },
            nt_name: {
                type: DataTypes.STRING(255),
            },
            nt_note_template_type_uuid:
            {
                type: DataTypes.INTEGER,
            },
            nt_note_type_uuid:
            {
                type: DataTypes.INTEGER,
            },
            nt_facility_uuid:
            {
                type: DataTypes.INTEGER,
            },
            nt_department_uuid:
            {
                type: DataTypes.INTEGER,
            },
            nt_data_template:
            {
                type: DataTypes.STRING,
            },
            nt_is_default: {
                type: DataTypes.BOOLEAN
            },
            nt_revision: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            nt_created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            nt_modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            nt_created_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            modified_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            nt_status: {
                type: DataTypes.BOOLEAN
            },
            nt_is_active: {
                type: DataTypes.BOOLEAN,
            },
            ntt_uuid: {
                type: DataTypes.INTEGER,
            },
            ntt_name: {
                type: DataTypes.STRING(255),
            },
            ntt_status: {
                type: DataTypes.BOOLEAN
            },
            ntt_is_active: {
                type: DataTypes.BOOLEAN,
            },
            nty_uuid: {
                type: DataTypes.INTEGER,
            },
            nty_name: {
                type: DataTypes.STRING(255),
            },
            nty_status: {
                type: DataTypes.BOOLEAN
            },
            nty_is_active: {
                type: DataTypes.BOOLEAN,
            },
            d_uuid: {
                type: DataTypes.INTEGER,
            },
            d_name: {
                type: DataTypes.STRING,
            },
            d_status: {
                type: DataTypes.BOOLEAN,
            },
            d_is_active: {
                type: DataTypes.BOOLEAN,
            },
            f_uuid: {
                type: DataTypes.INTEGER,
            },
            f_name: {
                type: DataTypes.STRING,
            },
            f_status: {
                type: DataTypes.BOOLEAN,
            },
            f_is_active: {
                type: DataTypes.BOOLEAN,
            },


        },
        {
            freezeTableName: true
        }
    );
    return vw_note_template;
};
