const uuidparse = require("uuid-parse");

module.exports = (sequelize, DataTypes) => {
    const vw_all_templates = sequelize.define(
        "vw_all_templates",
        {
            tm_uuid: {
                type: DataTypes.INTEGER,
            },
            tm_name: {
                type: DataTypes.STRING(100),
            },
            tm_template_type_uuid: {
                type: DataTypes.INTEGER,
            },
            tm_user_uuid: {
                type: DataTypes.INTEGER,
            },
            tm_status: {
                type: DataTypes.BOOLEAN,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
            },
            tm_is_public: {
                type: DataTypes.BOOLEAN,
            },
            tm_facility_uuid: {
                type: DataTypes.INTEGER,
            },
            tm_department_uuid: {
                type: DataTypes.INTEGER,
            },
            tt_name: {
                type: DataTypes.STRING(100)
            },
            tt_status: {
                type: DataTypes.BOOLEAN,
            },
            tt_is_active: {
                type: DataTypes.BOOLEAN,
            },
            f_uuid: {
                type: DataTypes.INTEGER,
            },
            f_name: {
                type: DataTypes.STRING(100)
            },
            f_is_active: {
                type: DataTypes.BOOLEAN,
            },
            f_status: {
                type: DataTypes.BOOLEAN,
            },
            d_uuid: {
                type: DataTypes.INTEGER,
            },
            d_name: {
                type: DataTypes.STRING(100)
            },
            tm_created_by: {
                type: DataTypes.INTEGER,
            },
            tm_created_date: {
                type: DataTypes.DATE,
            },
            tm_modified_by: {
                type: DataTypes.INTEGER,
            },
            tm_modified_date: {
                type: DataTypes.INTEGER,
            },
            uct_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            // u_salutation_uuid: {
            //     type: DataTypes.INTEGER,
            // },
            u_first_name: {
                type: DataTypes.STRING(255)
            },
            u_middle_name: {
                type: DataTypes.STRING(255)
            },
            u_last_name: {
                type: DataTypes.STRING(255)
            },
            // u_is_active: {
            //     type: DataTypes.BOOLEAN,
            // },
            // u_status: {
            //     type: DataTypes.BOOLEAN,
            // },
            umt_name: {
                type: DataTypes.STRING,
                allowNull: true,
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
            }
        },
        {
            timestamps: false
        }
    );

    return vw_all_templates;
};