

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
                type: DataTypes.INTEGER,
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
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: true
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
    procedures.associate = models => {
        procedures.belongsTo(models.procedure_scheme, {
            foreignKey: "procedure_scheme_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.procedure_technique, {
            foreignKey: "procedure_technique_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.procedure_version, {
            foreignKey: "procedure_version_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.procedure_region, {
            foreignKey: "procedure_region_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.procedure_type, {
            foreignKey: "procedure_type_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.procedure_category, {
            foreignKey: "procedure_category_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.procedure_sub_category, {
            foreignKey: "procedure_sub_category_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.operation_type, {
            foreignKey: "operation_type_uuid",
            // targetKey:"uuid"
        });
        procedures.belongsTo(models.anesthesia_type, {
            foreignKey: "anaesthesia_type_uuid",
            // targetKey:"uuid"
        });
        //  procedures.belongsTo(models.procedure_scheme, {
        //     foreignKey: "speciality_uuid",
        //     // targetKey:"uuid"
        // });
        // procedures.belongsTo(models.procedure_scheme, {
        //     foreignKey: "equipment_uuid",
        //     // targetKey:"uuid"
        // });
        procedures.belongsTo(models.body_site, {
            foreignKey: "body_site_uuid",
            // targetKey:"uuid"
        });

        procedures.hasMany(models.procedure_note_templates, {
            foreignKey: "procedure_uuid",
            targetKey:"uuid"
        });
    };

    return procedures;
};