
module.exports = (sequelize, DataTypes) => {

    const PATIENT_ALLERGY_STATUS = sequelize.define(
        'patient_allergy_status',
        {
            uuid: {

                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,

            },
            code: {
                type: DataTypes.STRING,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            }
            ,
            is_active: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            status: {

                type: DataTypes.BOOLEAN,
                defaultValue: 1,
                allowNull: false

            },
            revision: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false

            },

            created_by: {

                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: true

            },

            modified_by: {

                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0

            },
        },
        {
            tableName: 'patient_allergy_status',
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ['uuid']
            }]
        }
    );

    return PATIENT_ALLERGY_STATUS;
};