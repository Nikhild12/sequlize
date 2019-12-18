const uuidParse = require ("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const template_master = sequelize.define(
        "template_master",
        {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            template_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },
            },
            code: {
                type: DataTypes.STRING(8),
                allowNull: true
            }, 
            name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            diagnosis_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },
            },
            is_public: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },
            },
            user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                },
            },             
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            active_from: {
                type: DataTypes.DATE,
                allowNull:true
            },
            active_to: {
                type: DataTypes.DATE,
                allowNull:true
            },
            comments: {
                type: DataTypes.STRING(225),
                allowNull:true
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
            tableName: "template_master",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    );

   template_master.associate = models => {
        template_master.hasMany(models.template_master_details, {
            foreignKey: "template_master_uuid"
        });
   }
    
    return template_master;
};

