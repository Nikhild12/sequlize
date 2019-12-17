

module.exports = (sequelize, DataTypes) => {
    const diagnosis_region = sequelize.define(
        "diagnosis_region", {
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

            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            language:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            Is_default:{
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
            tableName: "diagnosis_region",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return diagnosis_region;
};