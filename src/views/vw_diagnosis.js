
module.exports = (sequelize, DataTypes) => {
    const vw_diagnosis = sequelize.define(
        "vw_diagnosis", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        diagnosis_scheme_uuid: {
            type: DataTypes.INTEGER,
        },
        diagnosis_type_uuid: {
            type: DataTypes.INTEGER,
        },
        diagnosis_category_uuid: {
            type: DataTypes.INTEGER,
        },
        diagnosis_grade_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        diagnosis_region_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        diagnosis_version_uuid: {
            type: DataTypes.INTEGER,

        },
        speciality: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        synonym: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        referrence_link: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        length_Of_stay: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        body_site_uuid: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        side_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        position_id: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        in_house: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        is_notifibale: {
            type: DataTypes.BOOLEAN,
            // allowNull: true

        },
        is_sensitive: {
            type: DataTypes.BOOLEAN,
            // allowNull: true

        },
        is_billable: {
            type: DataTypes.BOOLEAN,
            // allowNull: true
        },
        facility_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        department_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        comments: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        revision: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        diag_grade_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        diag_grade_name: {
            type: DataTypes.STRING,
        },
        bodyside_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        bodyside_name: {
            type: DataTypes.STRING,
        },
        bodysite_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        bodysite_name: {
            type: DataTypes.STRING,
        },
        diag_version_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        diag_version_name: {
            type: DataTypes.STRING,
        },
        diag_region_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        diag_region_name: {
            type: DataTypes.STRING,
        },
        posit_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        posit_name: {
            type: DataTypes.STRING,
        },
        diag_category_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        diag_category_name: {
            type: DataTypes.STRING,
        },
        diag_scheme_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        diag_scheme_name: {
            type: DataTypes.STRING,
        },
        diag_type_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        diag_type_name: {
            type: DataTypes.STRING,
        },
        uct_name: {
            type: DataTypes.STRING,
        },
        uc_first_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        uc_middle_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        uc_last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        umt_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        um_first_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        um_middle_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        um_last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
department_name:{
    type: DataTypes.STRING,
            allowNull: true,
},
facility_name:{
    type: DataTypes.STRING,
            allowNull: true,
}
    }, {
        tableName: "vw_diagnosis",
    }
    );

    return vw_diagnosis;
};