

module.exports = (sequelize, DataTypes) => {
    const immunizations = sequelize.define(
        "immunizations", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            description: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            condition_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            referrence_link: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            instruction: {
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
            tableName: "immunizations",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return immunizations;
};