
module.exports = (sequelize, DataTypes) => {
    const drug_frequency = sequelize.define(
        "drug_frequency", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        display: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        nooftimes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        perdayquantity: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },
        facility_uuid: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1,
            allowNull: false,
        },
        revision: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },

        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
    },
        {
            tableName: "drug_frequency",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    return drug_frequency;
};