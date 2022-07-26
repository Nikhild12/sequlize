

module.exports = (sequelize, DataTypes) => {
    const positions = sequelize.define(
        "positions", {
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
        revision: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        display_order: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        tableName: "positions",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );

    return positions;
};