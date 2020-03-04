

module.exports = (sequelize, DataTypes) => {
    const procedure_note_templates = sequelize.define(
        "procedure_note_templates", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns
            procedure_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
           
            note_template_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            note_template_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            display_order:{
                type: DataTypes.INTEGER,
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
           
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
           
        }, {
            tableName: "procedure_note_templates",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );
    procedure_note_templates.associate = models => {
        procedure_note_templates.belongsTo(models.procedures, {
            foreignKey: "procedure_uuid"
        });
    };
    return procedure_note_templates;
};