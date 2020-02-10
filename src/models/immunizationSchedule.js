

module.exports = (sequelize, DataTypes) => {
    const immunization_schedule = sequelize.define(
        "immunization_schedule", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
           
            schedule_uuid: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            immunization_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            immunization_name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            immunization_schedule_flag_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            immunization_route_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            immunization_dosage_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            duration: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            immunization_period_uuid: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            display_order: {
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
                allowNull: true,
                defaultValue: 0
            },
           
        }, {
            tableName: "immunization_schedule",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return immunization_schedule;
};