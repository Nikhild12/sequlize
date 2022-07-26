module.exports = (sequelize, DataTypes) => {

    const vital_value_type = sequelize.define(
        "vital_value_type",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            code:{
                type: DataTypes.STRING(8),
                unique:true,
                allowNull:true
            },
            name:{
                type: DataTypes.STRING(100),
                unique:true,
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
                defaultValue: 1,                
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
            // freezeTableName: true,
            tableName: "vital_value_type",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
           
        }
    );    

    return vital_value_type;
};