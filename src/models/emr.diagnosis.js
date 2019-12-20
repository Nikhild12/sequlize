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
            diagnosis_scheme_uuid: {
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
            diagnosis_version_uuid: {
                type: DataTypes.INTEGER,
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
            body_site_uuid:{
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
            facility_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            side_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
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
            tableName: "diagnosis",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes:[
                {
                    fields:["uuid"]
                }
            ]

        }
    );

    return diagnosis;
};