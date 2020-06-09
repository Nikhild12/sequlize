
module.exports = (sequelize, DataTypes) => {
    const VW_TREATMENT_KIT_LIST = sequelize.define(
        "vw_treatment_kit_list",
        {

            u_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            uc_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            uc_middle_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            uc_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            um_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            um_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            um_middle_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            um_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tk_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            tk_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            tk_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tk_is_public: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            tk_code: {
                type: DataTypes.STRING,
                allowNull: true
            },
            tk_is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false

            },
            modified_date: {
                type: DataTypes.DATE
            },
            d_uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            d_name: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            created_date: {
                type: DataTypes.DATE
            },
            activefrom: {
                type: DataTypes.DATE
            },
            activeactiveto: {
                type: DataTypes.DATE
            },
            description: {
                type: DataTypes.STRING(500)
            }
        },
        {
            tableName: "vw_treatment_kit_list",
            timestamps: false
        }
    );

    return VW_TREATMENT_KIT_LIST;
};