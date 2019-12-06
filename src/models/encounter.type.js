module.exports = (sequelize, DataTypes) => {

    const ENCOUNTER_TYPE = sequelize.define(
        "encounter_type",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING
            },
            name: {
                type: DataTypes.STRING
            },
            display_order: {
                type: DataTypes.INTEGER
            },
            is_active: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            status: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            revision: {
                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1",
            },
            created_by: {
                type: DataTypes.INTEGER
            },
            modified_by: {
                type: DataTypes.INTEGER
            }
        },
        {
            freezeTableName: true,
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]
        }
    )

    return ENCOUNTER_TYPE;
}