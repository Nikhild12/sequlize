module.exports = (sequelize, DataTypes) => {
    const speciality_sketch_details = sequelize.define(
        "speciality_sketch_details", {
            uuid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            // 1 to 21 columns
            speciality_sketch_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            sketch_path: {
                type: DataTypes.STRING(250),
                allowNull: true
            },
            
            status: {
                type: DataTypes.BOOLEAN,
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
            },
        }, {
            tableName: "speciality_sketch_details",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [{
                fields: ["uuid"]
            }]
        }
    );

    return speciality_sketch_details;
};