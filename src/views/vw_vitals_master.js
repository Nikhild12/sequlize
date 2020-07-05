module.exports = (sequelize, DataTypes) => {
    const vw_vitals_master = sequelize.define(
        "vw_vitals_master",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            vital_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            mnemonic: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            loinc_code_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            uom_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            vital_value_type_uuid: {
                type: DataTypes.INTEGER,

            },
            value_format: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            reference_range_from: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            reference_range_to: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,

            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,

            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            created_date: {
                type: DataTypes.STRING
            },
            modified_date: {
                type: DataTypes.STRING
            },
            vt_uuid: {
                type: DataTypes.INTEGER,
            },
            vt_code: {
                type: DataTypes.STRING(50)
            },
            vt_name: {
                type: DataTypes.STRING(50)
            },
            vvt_uuid: {
                type: DataTypes.INTEGER,
            },
            vvt_code: {
                type: DataTypes.STRING(50)
            },
            vvt_name: {
                type: DataTypes.STRING(50)
            },
            // um_code: {
            //     type: DataTypes.STRING(50),
            // },
            // um_name: {
            //     type: DataTypes.STRING(50),
            // },
            eu_uuid: {
                type: DataTypes.INTEGER,
            },
            eu_code: {
                type: DataTypes.STRING(50)
            },
            eu_name: {
                type: DataTypes.STRING(50)
            },
            lm_code: {
                type: DataTypes.STRING(50),
            },
            lm_name: {
                type: DataTypes.STRING(50),
            },
            u_first_name: {
                type: DataTypes.STRING(255),
            },
            u_middle_name: {
                type: DataTypes.STRING(255),
            },
            u_last_name: {
                type: DataTypes.STRING(255),
            },
            m_first_name: {
                type: DataTypes.STRING(255),
            },
            m_middle_name: {
                type: DataTypes.STRING(255),
            },
            m_last_name: {
                type: DataTypes.STRING(255),
            },

        },
        {
            freezeTableName: true,
        }
    );
    vw_vitals_master.associate = models => {

        vw_vitals_master.hasOne(models.vital_loinc, {
            foreignKey: "vital_master_uuid",
            targetKey: "uuid"
        });
    };
    return vw_vitals_master;
};