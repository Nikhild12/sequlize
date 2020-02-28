

module.exports = (sequelize, DataTypes) => {
    const note_templates = sequelize.define(
        "note_templates", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns
            code: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
           
            name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            note_template_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            note_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            facility_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            department_uuid:{ 
                type: DataTypes.INTEGER,
                allowNull: true
            },
            data_template:{
                type: DataTypes.STRING(250),
                allowNull: true
            },
                 
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0
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
            tableName: "note_templates",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    note_templates.associate = models => {
        
        note_templates.belongsTo(models.note_type, {
            foreignKey: "note_type_uuid",
            targetKey:"uuid"
        });
        note_templates.belongsTo(models.note_template_type, {
            foreignKey: "note_template_type_uuid"
        });
    };
    return note_templates;
};