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
        // 1 to 21 columns
        allergey_code: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        allergy_name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        allergy_type_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        allergy_description: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        allergy_source_uuid: {
            type: DataTypes.INTEGER

        },
        allergy_severity_uuid: {
            type: DataTypes.INTEGER

        },

        generic_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        diet_item_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        item_master_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },


        revision: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: "allergy_masters",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );
    allergy_masters.associate = models => {
        allergy_masters.belongsTo(models.allergy_type, {
            foreignKey: "allergy_type_uuid"
        });
    };


    return allergy_masters;
};