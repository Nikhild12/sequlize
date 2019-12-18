
module.exports = (sequelize, DataTypes) => {
    const patient_attachments = sequelize.define(
        "patient_attachments",
        {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            patient_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            encounter_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            consultation_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            attachment_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            attachment_name: {
                type: DataTypes.STRING(100),
                allowNull: true
            }, 
            file_path: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            comments: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            is_active:{
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            status:{
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            revision:{
                type : DataTypes.INTEGER,
                allowNull : false
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                
            },
        },
        {
            tableName: "patient_attachments",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

    return patient_attachments;
};

