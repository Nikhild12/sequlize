

module.exports = (sequelize, DataTypes) => {
    const ALLERGY_REACTIONS = sequelize.define(
        "allergy_reactions", {
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
            allowNull: true,
            defaultValue: 0
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
        tableName: "allergy_reactions",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );


    return ALLERGY_REACTIONS;
};