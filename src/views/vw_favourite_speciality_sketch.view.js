module.exports = (sequelize, DataTypes) => {
    const VW_FAVOUIRTE_SPECIALITY_SKETCH = sequelize.define(
        "vw_favourite_speciality_sketch",
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
            fm_is_active: {
                type: DataTypes.BOOLEAN
            },
            fmd_speciality_sketch_uuid: {
                type: DataTypes.INTEGER
            },
            ss_name: {
                type: DataTypes.STRING,
            },
            ss_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
            },
            ss_description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            ss_status: {
                type: DataTypes.BOOLEAN
            },
            ss_is_active: {
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
            tableName: "vw_favourite_speciality_sketch",
            timestamps: false
        }

    );

    return VW_FAVOUIRTE_SPECIALITY_SKETCH;
};