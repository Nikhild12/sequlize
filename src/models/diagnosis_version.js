

module.exports = (sequelize, DataTypes) => {
    const diagnosis_version = sequelize.define(
        "diagnosis_version", {
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
            color:{
                type: DataTypes.STRING,
                allowNull: true
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            language:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            display_order:{
                type: DataTypes.INTEGER,
                allowNull: true
            },
            Is_default:{
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.STRING,
                allowNull: false
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
            tableName: "diagnosis_version",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    diagnosis_version.associate = models => {
        diagnosis_version.belongsTo(models.diagnosis, {
             foreignKey: "uuid",
            //  targetKey : "diagnosis_version_uuid"
         });
     };

    return diagnosis_version;
};