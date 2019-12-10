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
            diagnosis_code_scheme_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
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
            diagnosis_Version_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            code_region_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            category: {
                type: DataTypes.STRING(250),
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
            body_site: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.STRING,
                allowNull: false
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
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
            comments: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            active_status_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            side_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            test_master_position_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            category_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            grade_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

        }, {
            tableName: "diagnosis",
            createdAt: 'created_date',
            updatedAt: 'updated_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return diagnosis;
};