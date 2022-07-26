module.exports = (sequelize, DataTypes) => {

    const vital_masters = sequelize.define(
        "vital_masters", {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            vital_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            description: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            value_format: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            mnemonic: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            loinc_code_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            uom_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            emr_uom_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            vital_value_type_uuid: {
                type: DataTypes.INTEGER,

            },
            reference_range_from: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            reference_range_to: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,

            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,

            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1,
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
            tableName: "vital_masters",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]

        }
    );
    vital_masters.associate = models => {
        vital_masters.belongsTo(models.vital_type, {
            foreignKey: "vital_type_uuid",
            as: 'vital_type'
        });
        vital_masters.belongsTo(models.vital_value_type, {
            foreignKey: "vital_value_type_uuid",
            as: 'vital_value_type'
        });
        vital_masters.hasOne(models.vital_loinc, {
            foreignKey: "vital_master_uuid",
            targetKey: "uuid"
        });
        vital_masters.hasMany(models.vital_master_uoms, {
            foreignKey: "vital_master_uuid"
        });
    };
    return vital_masters;
};