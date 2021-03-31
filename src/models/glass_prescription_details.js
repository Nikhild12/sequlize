module.exports = (sequelize, DataTypes) => {
    const glass_prescription_details = sequelize.define(
        "glass_prescription_details", {
        uuid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        prescription_uuid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        re_dis_sph: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        re_dis_cyl: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        re_dis_axis: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        re_dis_vis_acu: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        re_near_sph: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        re_near_cyl: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        re_near_axis: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        re_near_vis_acu: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        le_dis_sph: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        le_dis_cyl: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        le_dis_axis: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        le_dis_vis_acu: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        le_near_sph: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        le_near_cyl: {
            type: DataTypes.DECIMAL(16, 2),
            defaultValue: '0.00'
        },
        le_near_axis: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        le_near_vis_acu: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        revision: {
            type: DataTypes.STRING,
            defaultValue: 1
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
        }
    },
        {
            tableName: "glass_prescription_details",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }],
            defaultScope: {
                where: {
                    status: 1
                }
            }
        }
    );
    return glass_prescription_details;
};