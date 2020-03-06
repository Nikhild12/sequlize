module.exports = (sequelize, DataTypes) => {
    const procedure_technique = sequelize.define(
        "procedure_technique", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(250),
        },
        name: {
            type: DataTypes.STRING(250),
        },
        color: {
            type: DataTypes.STRING(250),
        },
        language: {
            type: DataTypes.INTEGER,
        },
        display_order: {
            type: DataTypes.INTEGER,
        },
        Is_default: {
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
    },
        {
            tableName: "procedure_technique",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    return procedure_technique;
};