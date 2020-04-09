
module.exports = (sequelize, DataTypes) => {
    const diagnosis = sequelize.define(
        "diagnosis", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        diagnosis_scheme_uuid: {
            type: DataTypes.INTEGER,
        },
        diagnosis_type_uuid: {
            type: DataTypes.INTEGER,
        },
        diagnosis_category_uuid: {
            type: DataTypes.INTEGER,
        },
        diagnosis_grade_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        diagnosis_region_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        diagnosis_version_uuid: {
            type: DataTypes.INTEGER,
            
        },
        speciality: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        synonym: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        referrence_link: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        length_Of_stay: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        body_site_uuid: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        side_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        position_id: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        in_house: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        is_notifibale: {
            type: DataTypes.BOOLEAN,
            // allowNull: true

        },
        is_sensitive: {
            type: DataTypes.BOOLEAN,
            // allowNull: true

        },
        is_billable: {
            type: DataTypes.BOOLEAN,
            // allowNull: true
        },
        facility_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        department_uuid: {
            type: DataTypes.INTEGER,
            // allowNull: true
        },
        comments: {
            type: DataTypes.STRING(250),
            // allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        revision: {
            type: DataTypes.INTEGER,
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
        tableName: "diagnosis",
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        indexes: [{
            fields: ["uuid"]
        }]
    }
    );

    diagnosis.associate = models => {
        diagnosis.belongsTo(models.diagnosis_type, {
            foreignKey: "diagnosis_type_uuid",
            //targetKey: "uuid",
            //as: "diagnosis_type"
        });
        diagnosis.belongsTo(models.body_side, {
            foreignKey: "side_uuid",
            //targetKey: "uuid",
            //as: "body_side"
        });
        diagnosis.belongsTo(models.body_site, {
            foreignKey: "body_site_uuid",
            //targetKey: "uuid",
            //as: "body_site"
        });
        diagnosis.belongsTo(models.diagnosis_version, {
            foreignKey: "diagnosis_version_uuid",
            //targetKey: "uuid",
            //as: "diagnosis_version"
        });
        diagnosis.belongsTo(models.diagnosis_grade, {
            foreignKey: "diagnosis_grade_uuid",
            //targetKey: "uuid",
            //as: "diagnosis_grade"
        });
        diagnosis.belongsTo(models.diagnosis_scheme, {
            foreignKey: "diagnosis_scheme_uuid",
            //targetKey: "uuid",
            //as: "diagnosis_scheme"
        });
        diagnosis.belongsTo(models.diagnosis_region, {
            foreignKey: "diagnosis_region_uuid",
            //targetKey: "uuid",
            //as: "diagnosis_region"
        });
        diagnosis.belongsTo(models.positions, {
            foreignKey: "position_id",
            //targetKey: "uuid",
            //as: "positions"
        });
        diagnosis.belongsTo(models.diagnosis_category, {
            foreignKey: "diagnosis_category_uuid",
            //targetKey: "uuid",
            //as: "diagnosis_category"
        });
    };

    return diagnosis;
};