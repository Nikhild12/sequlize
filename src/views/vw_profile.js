module.exports = (sequelize, DataTypes) => {
    const vw_profile = sequelize.define(
        'vw_profile',
        {

            p_uuid: {

                type: DataTypes.INTEGER,


            },
            p_profile_code: {

                type: DataTypes.STRING(255),


            },
            p_profile_name: {

                type: DataTypes.STRING(255),

            },
            p_profile_description:
            {

                type: DataTypes.STRING(255),

            },
            p_profile_type_uuid:
            {

                type: DataTypes.INTEGER,


            },
            p_facility_uuid:
            {

                type: DataTypes.INTEGER,


            },
            p_department_uuid:
            {

                type: DataTypes.INTEGER,


            },
            p_status: {

                type: DataTypes.BOOLEAN


            },
            p_is_active: {

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
            p_created_date: {
                type: DataTypes.DATE
            },

            modified_date: {
                type: DataTypes.DATE
            },


        },
        {
            freezeTableName: true
        }
    );
    return vw_profile;
};
