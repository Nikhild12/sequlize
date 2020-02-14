module.exports = (sequelize, DataTypes) => {
    const speciality_sketches = sequelize.define(
        "speciality_sketches", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns
            code: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            name: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            department_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            sketch_name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            sketch_path: {
                type: DataTypes.STRING,
                allowNull: true
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1
            },
            revision: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 1,
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
            },
        }, {
            tableName: "speciality_sketches",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return speciality_sketches;
};