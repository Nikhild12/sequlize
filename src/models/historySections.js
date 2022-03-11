module.exports = function (sequelize, DataTypes) {
    const history_section = sequelize.define("history_sections", {
        uuid: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        history_uuid: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false
        },
        section_name: {
            type: DataTypes.STRING(250),
            allowNull: true
        },
        value_type_uuid: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        display_order: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        is_mandatory: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
        is_multiple: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
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
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1
        },
        created_by: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0,
            validate: {
                notNull: true
            }
        },
        modified_by: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0,
            validate: {
                notNull: true
            }
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'history_sections',
        createdAt: 'created_date',
        updatedAt: 'modified_date',
        timestamps: false,
        indexes: [{
            fields: ["uuid"]
        }]
    });

    return history_section;
};