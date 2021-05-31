const emr_constants = require('../config/constants');
module.exports = (sequelize, DataTypes) => {
    const allergy_masters = sequelize.define(
        "allergy_masters", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        allergey_code: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        allergy_name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        allergy_description: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        allergy_type_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        comments: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        allergy_source_uuid: {
            type: DataTypes.INTEGER
        },
        allergy_severity_uuid: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        revision: {
            type: DataTypes.STRING,
            defaultValue: 1
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        status: {
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
        tableName: "allergy_masters",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );
    allergy_masters.associate = models => {
        allergy_masters.belongsTo(models.allergy_source, {
            foreignKey: "allergy_source_uuid"
        });
        allergy_masters.belongsTo(models.allergy_severity, {
            foreignKey: "allergy_severity_uuid"
        });
        allergy_masters.belongsTo(models.allergy_type, {
            foreignKey: "allergy_type_uuid"
        });
    };

    return allergy_masters;
};