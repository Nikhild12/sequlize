

module.exports = (sequelize, DataTypes) => {
    const allergy_severity = sequelize.define(
        "allergy_severity", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        language: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        display_order: {
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
        tableName: "allergy_severity",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );


    return allergy_severity;
};