module.exports = (sequelize, DataTypes) => {

    const DISEASES = sequelize.define(
        "diseases",
        {
            uuid: {
                type: DataTypes.INTEGER,
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
            color: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            language: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            Is_default: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",

            },
            status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            created_date: 'created_date',
            modified_date: 'modified_date',

            created_by: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            modified_by: {

                type: DataTypes.INTEGER,
                allowNull: false

            }
        },
        {
            freezeTableName: true,
            timestamps: false,
            createAt: 'created_date',
            updatedAt: 'modified_date'
        }
    );

    return DISEASES;
};