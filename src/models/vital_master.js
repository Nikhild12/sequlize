module.exports = (sequelize, DataTypes) => {

    const vital_masters = sequelize.define(
        "vital_masters",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            vital_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name:{
                type: DataTypes.STRING(100),
                allowNull:true
            },
            description:{
                type: DataTypes.STRING(100),
                allowNull:true
            },
            mnemonic:{
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            loinc_code_master_uuid:{
                type: DataTypes.INTEGER,
                allowNull:true
            },
            uom_master_uuid:{
                type: DataTypes.INTEGER,
                allowNull:true                
            },
            vital_value_type_uuid:{
                type: DataTypes.INTEGER,
                
            },
            reference_range_from:{
                type: DataTypes.DATE,
                allowNull: true
            },
            reference_range_to:{
                type: DataTypes.DATE,
                allowNull: true
            },
            is_default:{
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            is_active:{
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                 // allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                // allowNull: false,
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: true,                
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: "vital_masters",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes:[
                {
                    fields:["uuid"]
                }
            ]

        }
    );    
    vital_masters.associate =  models => {
        vital_masters.belongsTo(models.vital_type , {
            foreignKey:"vital_type_uuid",
            as:'vital_type'
        });
        vital_masters.belongsTo(models.vital_value_type , {
            foreignKey:"vital_value_type_uuid",
            as:'vital_value_type'
        });
    };
    return vital_masters;
};