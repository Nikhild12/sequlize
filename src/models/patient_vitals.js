module.exports = (sequelize, DataTypes) => {
    const patient_vitals = sequelize.define(
        "patient_vitals", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        facility_uuid: {
            type: DataTypes.INTEGER,
        },

        department_uuid: {
            type: DataTypes.INTEGER,
        },

        patient_uuid: {
            type: DataTypes.INTEGER,
        },


        encounter_uuid: {
            type: DataTypes.INTEGER,
        },

        encounter_type_uuid: {
            type: DataTypes.INTEGER,
        },


        doctor_uuid: {
            type: DataTypes.INTEGER,
        },

        consultation_uuid: {
            type: DataTypes.INTEGER,
        },


        performed_date: {
            type: DataTypes.DATE,
        },



        vital_group_uuid: {
            type: DataTypes.INTEGER,
        },


        vital_type_uuid: {
            type: DataTypes.INTEGER,
        },

        vital_master_uuid: {
            type: DataTypes.INTEGER,
        },

        mnemonic_code: {
            type: DataTypes.STRING(250),
        },
        loinc_code: {
            type: DataTypes.STRING(250),
        },
      
        vital_qualifier_uuid: {
            type: DataTypes.INTEGER,
        },
        vital_value_type_uuid: {
            type: DataTypes.INTEGER,
        },

        vital_value: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        },

    
        vital_uom_uuid: {
            type: DataTypes.INTEGER,
        },


        reference_range_from: {
            type: DataTypes.STRING,
        },

        reference_range_to: {
            type: DataTypes.STRING,
        },


        patient_vital_status_uuid: {
            type: DataTypes.INTEGER,
        },
        display_order: {
            type: DataTypes.INTEGER,
        },
        comments: {
            type: DataTypes.STRING,
        },





        tat_start_time: {
            type: DataTypes.DATE,
        },

        tat_end_time: {
            type: DataTypes.DATE,
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
            defaultValue: 1
        },


        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },


        created_date: {
            type: DataTypes.DATE,
        },



        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        modified_date: {
            type: DataTypes.DATE,
        },




    },
        {
            tableName: "patient_vitals",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    return patient_vitals;
};













