

module.exports = (sequelize, DataTypes) => {
    const procedure_version = sequelize.define(
        "procedure_version", {
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
            },
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            color:{
                type: DataTypes.STRING,
                allowNull: true
            },
            Is_default:{
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 1,
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
            tableName: "procedure_version",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return procedure_version;
};