const emr_constants = require('../config/constants');

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
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('template_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('template_type_uuid')
                    },
                    min: 0
                }
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
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('diagnosis_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('diagnosis_uuid')
                    },
                    min: 0
                }
            },
            is_public: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            facility_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('facility_uuid')
                    },
                    min: 0
                }
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('department_uuid')
                    },
                    min: 0
                }
            },
            user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('user_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('user_uuid')
                    },
                    min: 0
                }
            },             
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('display_order')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('display_order')
                    },
                    min: 0
                }
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
                type: DataTypes.BOOLEAN,
                defaultValue: 1
                //allowNull: false
            },
            status:{
                type: DataTypes.BOOLEAN,
                defaultValue: 1
                //allowNull: false
            },
            revision:{
                type : DataTypes.INTEGER,
                defaultValue: 1
                
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }
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
   };
    
    return template_master;
};

