

module.exports = (sequelize, DataTypes) => {
    const procedures = sequelize.define(
        "procedures", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns
            procedure_scheme_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            code: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
           
            name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            procedure_technique_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            procedure_version_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            procedure_region_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            procedure_type_uuid:{
                type: DataTypes.STRING,
                allowNull: true
            },
            procedure_category_uuid:{
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            procedure_sub_category_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            operation_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            anaesthesia_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            speciality_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            equipment_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            body_site_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            duration:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            description:{
                type: DataTypes.STRING(250),
                allowNull: true
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 1,
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
            tableName: "procedures",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    // procedures.associate =  models => {
    //     procedures.belongsTo(models.procedures , {
    //         foreignKey:"vital_type_uuid",
    //         as:'vital_type'
    //     });
    //       };

    return procedures;
};