module.exports = (sequelize, DataTypes) => {
    const diagnosis = sequelize.define(
        "diagnosis", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns


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
                allowNull: true
            },

            diagnosis_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            diagnosis_category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            diagnosis_grade_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            diagnosis_region_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            diagnosis_version_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
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
                allowNull: true
            },
            length_Of_stay: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            body_site_uuid: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            side_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            position_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            in_house: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            is_notifibale: {
                type: DataTypes.INTEGER,
                allowNull: true

            },
            is_sensitive: {
                type: DataTypes.INTEGER,
                allowNull: true

            },
            is_billable: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            comments: {
                type: DataTypes.STRING(250),
                allowNull: true
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
                type: DataTypes.STRING,
                allowNull: false
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

        }, {
            tableName: "diagnosis",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return diagnosis;
};