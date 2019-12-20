const emr_constants = require('../config/constants');

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
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('patient_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('patient_uuid')
                    },
                    min: 0
                }
            },
            encounter_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('encounter_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('encounter_uuid')
                    },
                    min: 0
                }
            },
            consultation_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('consultation_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('consultation_uuid')
                    },
                    min: 0
                }
            },
            attachment_type_uuid:{
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('attachment_type_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('attachment_type_uuid')
                    },
                    min: 0
                }
            },
            attached_date:{
                type: DataTypes.DATE,
                allowNull: true,
            },
            attachment_name: {
                type: DataTypes.STRING(100),
                allowNull: true
            }, 
            file_path: {
                type: DataTypes.STRING(2000),
                allowNull: false,
            },
            comments: {
                type: DataTypes.STRING(2000),
                allowNull: true,
            },
            is_active:{
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false
            },
            status:{
                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false
            },
            revision:{
                type : DataTypes.INTEGER,
                allowNull : false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('revision')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('revision')
                    },
                    min: 0
                }
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

    patient_attachments.associate =  models => {
        patient_attachments.belongsTo(models.attachment_type , {
            foreignKey:"attachment_type_uuid",
            as:'attachment_type'
        });
        patient_attachments.belongsTo(models.encounter , {
            foreignKey:"encounter_uuid",
            as:'encounter'
        });
    };

    return patient_attachments;
};

