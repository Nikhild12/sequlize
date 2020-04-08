
module.exports = (sequelize, DataTypes) => {
    const dosage = sequelize.define(
        "dosage", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
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
            display_order: {
                type: DataTypes.INTEGER,         
                       
            },
            language_uuid: {
                type: DataTypes.INTEGER,
            },
            is_defult: {
                type: DataTypes.BOOLEAN,
                // allowNull: true

            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
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
            tableName: "dosage",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

  return dosage;
};