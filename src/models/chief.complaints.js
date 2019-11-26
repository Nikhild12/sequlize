module.exports = (sequelize, DataTypes) => {

    const CHIEF_COMPLAINTS = sequelize.define(
        "chief_complaints",
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
            description: {
                type: DataTypes.STRING
            },
            chief_complaint_category_uuid: {
                type: DataTypes.INTEGER,
            },
            referrence_link: {
                type: DataTypes.STRING
            },
            body_site: {
                type: DataTypes.STRING
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
                allowNull: false,
                validate: {
                    notNull: true
                }

            },
            modified_by: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: true
                }

            }
        }
    )
    return CHIEF_COMPLAINTS;
}