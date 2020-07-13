// s_uuid, s_code, s_name, s_description, s_sketch_name,
//     s_facility_uuid, s_department_uuid, s_status, s_is_active, s_created_date,
//     d_uuid, d_name, d_status, d_is_active, modified_date

module.exports = (sequelize, DataTypes) => {
    const vw_speciality_sketch = sequelize.define(
        'vw_speciality_sketch',
        {

            s_uuid: {

                type: DataTypes.INTEGER,


            },
            s_code: {

                type: DataTypes.STRING(255),


            },
            s_name: {

                type: DataTypes.STRING(255),

            },
            s_description:
            {

                type: DataTypes.STRING(255),

            },
            s_sketch_name:
            {

                type: DataTypes.STRING(255),

            },
            s_facility_uuid:
            {

                type: DataTypes.INTEGER,


            },
            s_department_uuid:
            {

                type: DataTypes.INTEGER,


            },
            s_status: {

                type: DataTypes.BOOLEAN,
                defaultValue:1

            },
            s_is_active: {

                type: DataTypes.BOOLEAN,

            },
            d_uuid: {

                type: DataTypes.INTEGER,


            },
            d_name: {

                type: DataTypes.STRING,


            },
            d_status: {

                type: DataTypes.BOOLEAN,


            },
            d_is_active: {

                type: DataTypes.BOOLEAN,


            },
            s_created_date: {
                type: DataTypes.DATE
            },

            modified_date: {
                type: DataTypes.DATE
            },


        },
        {
            freezeTableName: true,
            defaultScope:{
                where:{
                    s_status:1
                }
            }
        }
    );
    return vw_speciality_sketch;
};
