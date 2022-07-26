module.exports = (sequelize, DataTypes) => {
    const CHIEF_COMPLAINT_DURATION_PERIODS = sequelize.define(
        "chief_complaint_duration_periods",
        {
            uuid: {

                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true

            },
            code: {

                type: DataTypes.STRING(50)

            },
            name: {

                type: DataTypes.STRING(100)

            },
            is_active: {

                type: DataTypes.ENUM,
                values: ["0", "1"],
                defaultValue: "1"

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

    return CHIEF_COMPLAINT_DURATION_PERIODS;
};