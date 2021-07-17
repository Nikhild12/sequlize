module.exports = (sequelize, DataTypes) => {

    const vital_master_uoms = sequelize.define(
        "vital_master_uoms", {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            vital_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            emr_uom_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            vital_value_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0
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
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        }, {
            tableName: "vital_master_uoms",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    vital_master_uoms.associate = models => {
        vital_master_uoms.belongsTo(models.emr_uom, {
            foreignKey: "emr_uom_uuid",
            as: 'emr_uom'
        });
        vital_master_uoms.belongsTo(models.vital_value_type, {
            foreignKey: "vital_value_type_uuid",
            as: 'vital_value_type'
        });
    };
    return vital_master_uoms;
};