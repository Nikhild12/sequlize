module.exports = (sequelize, DataTypes) => {

    const diagnosis = sequelize.define(
        "diagnosis",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            diagnosis_code_scheme_uuid: {
                type: DataTypes.INTEGER,
            },
            code:{
                type:DataTypes.STRING(50),
            },
            name:{
                type:DataTypes.STRING(50),
            },
            description: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            diagnosis_Version_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            code_region_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            category: {
                type:DataTypes.STRING(50),
                allowNull: false,
            },
            speciality:{
                type:DataTypes.STRING(50),
                allowNull: false,
            },
            synonym:{
                type:DataTypes.STRING(50),
                allowNull: false,
            },
            referrence_link:{
                type:DataTypes.STRING(50),
                allowNull: true,
            },
            length_Of_stay:{
                type:DataTypes.STRING(50),
                allowNull: false,
            },
            body_site:{
                type:DataTypes.STRING(50),
                allowNull: false,
            },
            is_notifibale:{
                type: DataTypes.INTEGER,
                allowNull:true
            },
            is_sensitive:{
                type: DataTypes.INTEGER,
                allowNull:true
            },
            is_billable:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            comments:{
                type:DataTypes.STRING,
                allowNull: false,
            },
            active_status_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            facility_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            side_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            test_master_position_id:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            category_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            grade_uuid:{
                type: DataTypes.INTEGER,
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
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: "diagnosis",
            createdAt: 'created_date',
            updatedAt: 'updated_date',
            indexes:[
                {
                    fields:["uuid"]
                }
            ]

        }
    );

    return diagnosis;
}