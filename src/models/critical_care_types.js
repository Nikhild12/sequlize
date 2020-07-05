const emr_constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const critical_care_types = sequelize.define(
        "critical_care_types",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            color: {
                type: DataTypes.STRING(15),
                allowNull: true
            },
            language: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            Is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                //allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                //allowNull: false
            },
            revision: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },

            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
        },
        {
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            tableName: "critical_care_types",
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );
    // critical_care_types.associate = models => {
    //     critical_care_types.hasOne(models.critical_care_charts, {
    //         foreignKey: "critical_care_type_uuid",
    //         as: 'critical_care_charts'
    //     });
    // };
    critical_care_types.associate = models => {
        critical_care_types.hasMany(models.critical_care_charts, {
            foreignKey: "critical_care_type_uuid",
            // as: 'critical_care_concepts'
        });
    };

    return critical_care_types;
};