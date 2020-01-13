module.exports = (sequelize, DataTypes) => {

    const vital_loinc = sequelize.define(
        "vital_loinc",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            vital_master_uuid:{
                type: DataTypes.INTEGER,
               
                allowNull:true
            },
            loinc_code:{
                type: DataTypes.STRING(100),
               
                allowNull:true
            },
            loinc_name:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },component:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },property:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },timing:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },system:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },scale:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },meathod:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },calss:{
                type: DataTypes.STRING(100),
                
                allowNull:true
            },
            is_active:{
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                 // allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                // allowNull: false,
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: true,                
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue:0
            }
        },
        {
            // freezeTableName: true,
            tableName: "vital_loinc",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
           
        }
    );    

    return vital_loinc;
};