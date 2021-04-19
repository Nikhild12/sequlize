module.exports = (sequelize, DataTypes) => { // Start -- H30-35488 - Need to track is_adult flag encounter wise

    const patient_age_details = sequelize.define(
        'patient_age_details',
        {
            patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            encounter_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            dob: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            encounter_created_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            age: {
                type: DataTypes.TINYINT(3),
                allowNull: false
            },
            period_uuid: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            is_adult: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                defaultValue: 1
            },
            created_by: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            modified_by: {
                type: DataTypes.INTEGER(11).UNSIGNED
            },
            modified_date: {
                type: DataTypes.DATE,
                defaultValue: null
            },
        },
        {
            tableName: 'patient_age_details',
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ['encounter_uuid', 'patient_uuid', 'is_adult']
            }]
        }
    );

    patient_age_details.associate = models => {
        patient_age_details.belongsTo(models.encounter, {
            foreignKey: 'encounter_uuid',
            as: 'encounter'
        });
    };

    return patient_age_details;
};