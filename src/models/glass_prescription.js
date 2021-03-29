module.exports = (sequelize, DataTypes) => {
    const glass_prescription = sequelize.define(
        "glass_prescription", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        prescription_no: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        prescription_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        facility_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        department_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        patient_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        encounter_type_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        encounter_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        doctor_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        appointment_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        notes: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        is_digitally_signed: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
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
            allowNull: true
        },

    }, {
        tableName: "glass_prescription",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );


    return glass_prescription;
};