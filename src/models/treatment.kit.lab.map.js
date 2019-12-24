module.exports = (sequelize, DataTypes) => {
    const TREATMENT_kIT_LAB_MAP = sequelize.define(
        'treatment_kit_lab_map',
        {
            uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true

            },
            treatment_kit_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false

            },
            test_master_uuid: {

                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: emr_constants.GetpleaseProvideMsg('test_master_uuid')
                    },
                    notEmpty: {
                        msg: emr_constants.GetpleaseProvideMsg('test_master_uuid')
                    },
                    min: 0
                }

            },
            quantity: {

                type: DataTypes.STRING(255),
                allowNull: true

            },
            is_active: {

                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false

            },
            status: {

                type: DataTypes.BOOLEAN,
                defaultValue: "1",
                allowNull: false

            },
            revision: {

                type: DataTypes.INTEGER

            },
            created_date: 'created_date',
            modified_date: 'modified_date',
            created_by: {

                type: DataTypes.INTEGER

            },
            modified_by: {

                type: DataTypes.INTEGER

            }
        },
        {

            tableName: "treatment_kit_lab_map",
            createdAt: 'created_date',
            updatedAt: 'modified_date',
            indexes: [
                {
                    fields: ["uuid"]
                }
            ]

        }
    );
    return TREATMENT_kIT_LAB_MAP;
};