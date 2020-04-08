

module.exports = (sequelize, DataTypes) => {
    const body_side = sequelize.define(
        "body_side", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns
            code: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
 language:{
                type: DataTypes.INTEGER,
                allowNull: true
            } ,
            color:{
                type: DataTypes.STRING(250),
                allowNull: true
            }, 
            display_order:{
                type: DataTypes.STRING(250),
                allowNull: true
            }, 
            Is_default: {
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
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
           
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
           
        }, {
            tableName: "body_side",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return body_side;
};