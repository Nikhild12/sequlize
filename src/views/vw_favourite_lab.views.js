module.exports = (sequelize, DataTypes) => {
    const VW_FAVOURITE_LAB = sequelize.define(
        "vw_favourite_lab",
        {
            fm_uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            fm_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            fm_user_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fm_favourite_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fm_department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fm_is_public: {
                type: DataTypes.BOOLEAN
            },
            fmd_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fmd_display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fmd_active: {
                type: DataTypes.BOOLEAN
            },
            fmd_status: {
                type: DataTypes.BOOLEAN
            },
            fm_description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            fm_display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fmd_test_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fm_status: {
                type: DataTypes.BOOLEAN
            },
            fm_created_date: {
                type: DataTypes.DATE
            },
            fm_modified_date: {
                type: DataTypes.DATE
            },
            fm_is_active: {
                type: DataTypes.BOOLEAN
            },
            ltm_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ltm_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            ltm_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            ltm_description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            ltm_lab_master_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ltm_status: {
                type: DataTypes.BOOLEAN
            },
            ltm_is_active: {
                type: DataTypes.BOOLEAN
            },
            lpm_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            lpm_profile_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            lpm_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            lpm_description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            lpm_lab_master_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            lpm_status: {
                type: DataTypes.BOOLEAN
            },
            lpm_is_active: {
                type: DataTypes.BOOLEAN
            },
            uct_name: {
                type: DataTypes.STRING
            },
            uc_first_name: {
                type: DataTypes.STRING
            },
            uc_middle_name: {
                type: DataTypes.STRING
            },
            uc_last_name: {
                type: DataTypes.STRING
            },
            umt_name: {
                type: DataTypes.STRING
            },
            um_first_name: {
                type: DataTypes.STRING
            },
            um_middle_name: {
                type: DataTypes.STRING
            },
            um_last_name: {
                type: DataTypes.STRING
            },
            tom_uuid: {
                type: DataTypes.INTEGER
            },
            tom_name: {
                type: DataTypes.STRING
            },
            tom_code: {
                type: DataTypes.STRING
            },
            fa_uuid: {
                type: DataTypes.INTEGER
            },
            fa_name: {
                type: DataTypes.STRING
            },
            dp_uuid: {
                type: DataTypes.INTEGER
            },
            dp_name: {
                type: DataTypes.STRING
            }
        },
        {
            tableName: "vw_favourite_lab",
            timestamps: false
        }

    );

    return VW_FAVOURITE_LAB;
};