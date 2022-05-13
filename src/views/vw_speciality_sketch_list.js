module.exports = (sequelize, DataTypes) => {
    const vw_speciality_sketch_list = sequelize.define(
        'vw_speciality_sketch_list',
        {
            ss_uuid: {
                type: DataTypes.INTEGER
            },
            ss_code: {
                type: DataTypes.STRING
            },
            ss_name: {
                type: DataTypes.STRING
            },
            ss_description: {
                type: DataTypes.STRING
            },
            ss_facility_uuid: {
                type: DataTypes.INTEGER
            },
            ss_department_uuid: {
                type: DataTypes.INTEGER
            },
            ss_sketch_name: {
                type: DataTypes.STRING
            },
            ss_is_active: {
                type: DataTypes.BOOLEAN
            },
            ss_status: {
                type: DataTypes.BOOLEAN
            },
            ss_revision: {
                type: DataTypes.INTEGER
            },
            //H30-49589-Saju-Speciality sketch api changes
            ss_url: {
                type: DataTypes.STRING
            },
            ss_created_by: {
                type: DataTypes.INTEGER
            },
            ss_created_date: {
                type: DataTypes.DATE
            },
            ss_modified_by: {
                type: DataTypes.DATE
            },
            ss_modified_date: {
                type: DataTypes.DATE
            },
            ssd_uuid: {
                type: DataTypes.INTEGER
            },
            ssd_speciality_sketch_uuid: {
                type: DataTypes.INTEGER
            },
            ssd_sketch_path: {
                type: DataTypes.STRING
            },
            ssd_status: {
                type: DataTypes.BOOLEAN
            },
            ssd_is_active: {
                type: DataTypes.BOOLEAN
            },
            ssd_created_by: {
                type: DataTypes.INTEGER
            },
            ssd_modified_by: {
                type: DataTypes.INTEGER
            },
            created_user_name:
            {

                type: DataTypes.STRING(255),

            },
            modified_user_name:
            {

                type: DataTypes.STRING(255),

            },
            created_title_name:
            {

                type: DataTypes.STRING(255),

            },
            modified_title_name:
            {

                type: DataTypes.STRING(255),

            },
            d_name: {
                type: DataTypes.STRING
            }
        },
        {
            freezeTableName: true
        }
    );

    return vw_speciality_sketch_list;
};