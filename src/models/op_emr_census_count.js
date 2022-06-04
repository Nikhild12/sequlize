module.exports = (sequelize, DataTypes) => {
    /**
     * ORM for op_emr_census_count table
     */
    const op_emr_census_count = sequelize.define(
        "op_emr_census_count", {
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
            facility_name: {
                type: DataTypes.STRING(45)
            },
            facility_type_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            facility_type_name: {
                type: DataTypes.STRING(45)
            },
            facility_category_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            department_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            department_name: {
                type: DataTypes.STRING(45)
            },
            patient_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            patient_pin_no: {
                type: DataTypes.STRING(45)
            },
            patient_name: {
                type: DataTypes.STRING(100)
            },
            //Bhaskar H30-50068 - APi Changes for DB //
            address: {
                type: DataTypes.STRING(255)
            },
            aadhaar_number: {
                type: DataTypes.STRING(100)
            },
            //Bhaskar H30-50068 - APi Changes for DB //
            age: {
                type: DataTypes.INTEGER(3)
            },
            period_uuid: {
                type: DataTypes.INTEGER(3)
            },
            mobile: {
                type: DataTypes.STRING(15)
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
            registered_session_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            registered_session_name: {
                type: DataTypes.STRING(15)
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
            visit_type_name: {
                type: DataTypes.STRING(15)
            },
            encounter_date: {
                type: DataTypes.DATE
            },
            encounter_session_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            encounter_session_name: {
                type: DataTypes.STRING(15)
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
            tableName: "op_emr_census_count",
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

    return op_emr_census_count;
};