module.exports = (sequelize, DataTypes) => {
    const TEMPLATE_MASTER_DETAILS = sequelize.define(
        "template_master_details",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            template_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            chief_complaint_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            vital_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            test_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            item_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            chief_complaint_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            vital_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            drug_route_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            drug_frequency_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            duration: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            duration_period_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            drug_instruction_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            comments: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1"
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1"
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },
            },

            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            tableName: "template_master_details",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return TEMPLATE_MASTER_DETAILS;
};