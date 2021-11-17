module.exports = (sequelize, DataTypes) => {

    const diagnosis_icd_10 = sequelize.define(
        "diagnosis_icd_10", {
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
                type: DataTypes.STRING(250)
                
            },
            length_Of_stay: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            body_site_uuid: {
                type: DataTypes.STRING(250)
               
            },
            side_uuid: {
                type: DataTypes.INTEGER
               
            },
            position_id: {
                type: DataTypes.INTEGER
                
            },
            in_house: {
                type: DataTypes.STRING(250)
               
            },
            disease_type_uuid: {
                type: DataTypes.STRING(250)
            },
            is_notifibale: {
                type: DataTypes.BOOLEAN

            },
            is_sensitive: {
                type: DataTypes.BOOLEAN
            
            },
            is_billable: {
                type: DataTypes.BOOLEAN
            
            },
            facility_uuid: {
                type: DataTypes.INTEGER
                
            },
            department_uuid: {
                type: DataTypes.INTEGER
               
            },
            comments: {
                type: DataTypes.STRING(250)
              
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
                defaultValue: 1
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            created_date: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            
            modified_date: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
        
        }, {
            tableName: "diagnosis_icd_10",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    

    return diagnosis_icd_10;
};