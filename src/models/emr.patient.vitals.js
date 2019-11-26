module.exports = (sequelize, DataTypes) => {

    const patient_vitals = sequelize.define(
        "patient_vitals",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            encounter_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            encounter_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            doctor_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            consultation_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            performed_date:{
                type: DataTypes.DATE,
                allowNull: true,
            },
            vital_group_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            vital_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            vital_master_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            mnemonic_code:{
                type: DataTypes.STRING(50),
                allowNull:true
            },
            loinc_code:{
                type: DataTypes.STRING(50),
                allowNull:true
            },
            vital_qualifier_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            vital_value_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            vital_value:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            vital_uom_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            reference_range_from:{
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            reference_range_to:{
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            patient_vital_status_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            comments:{
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false,
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: false,                
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: "patient_vitals",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes:[
                {
                    fields:["uuid"]
                }
            ]

        }
    );    
    return patient_vitals;
}