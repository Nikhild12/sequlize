

module.exports = (sequelize, DataTypes) => {
    const body_site = sequelize.define(
        "body_site", {
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
            color:{
                type: DataTypes.STRING(250),
                allowNull: true
            }, 
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: true
            }, 
            Is_default: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.BOOLEAN,
                // allowNull: false,
                defaultValue: 1
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
            tableName: "body_site",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return body_site;
};