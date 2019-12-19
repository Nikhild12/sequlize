
module.exports = (sequelize, DataTypes) => {
    const attachment_type = sequelize.define(
        "attachment_type",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            code:{
                type: DataTypes.STRING(50),
                unique:true,
                allowNull:true
            },
            color:{
                type: DataTypes.STRING(15),
                unique:true,
                allowNull:true
            },
            name:{
                type: DataTypes.STRING(100),
                unique:true,
                allowNull:true
            },
            language:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            Is_default:{
                type: DataTypes.BOOLEAN,
                allowNull: true,
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
                allowNull: false
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
        },
        
        {
            tableName: "attachment_type",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return attachment_type;
};

