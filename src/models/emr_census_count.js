// Bhaskar H30-46770 - New API for Emr census Count Entry
module.exports = (sequelize, DataTypes) => {
    /**
     * ORM for emr_census_count table
     */
    const emr_census_count = sequelize.define(
        "emr_census_count", {
            uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            patient_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            patient_pin_no: {
                type: DataTypes.STRING(45)
            },
            gender_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            is_adult: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            registration_date: {
                type: DataTypes.DATE
            },
            encounter_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            encounter_doctor_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            encounter_department_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            encounter_type_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            encounter_visit_type_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            encounter_date: {
                type: DataTypes.DATE
            },
            encounter_session_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            is_prescribed: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            created_by: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            modified_by: {
                type: DataTypes.INTEGER(11).UNSIGNED
            }
        }, {
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            tableName: "emr_census_count",
            indexes: [{
                fields: ["uuid"]
            }],
            defaultScope: {
                where: {
                    is_active: 1
                }
            }
        }
    );

    return emr_census_count;
};
// Bhaskar H30-46770 - New API for Emr census Count Entry