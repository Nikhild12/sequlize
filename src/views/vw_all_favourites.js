module.exports = (sequelize, DataTypes) => {
  const VW_ALL_FAVOURITES = sequelize.define(
    "vw_all_favourites",
    {
      fm_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      fm_favourite_type_uuid: {
        type: DataTypes.INTEGER
      },
      fm_is_public: {
        type: DataTypes.BOOLEAN
      },
      fm_facility_uuid: {
        type: DataTypes.INTEGER
      },
      fm_department_uuid: {
        type: DataTypes.INTEGER
      },
      fm_user_uuid: {
        type: DataTypes.INTEGER
      },
      is_active: {
        type: DataTypes.BOOLEAN
      },
      fm_status: {
        type: DataTypes.BOOLEAN
      },
      fm_name: {
        type: DataTypes.STRING
      },
      modified_date:{
        type: DataTypes.DATE
      },
      created_date:{
        type: DataTypes.DATE
      },
      ft_name:{
        type: DataTypes.STRING
      },
      ft_is_active: {
        type: DataTypes.BOOLEAN
      },
      ft_status: {
        type: DataTypes.BOOLEAN
      },
      f_uuid: {
        type: DataTypes.INTEGER
      },
      f_name: {
        type: DataTypes.STRING
      },
      f_is_active: {
        type: DataTypes.BOOLEAN
      },
      f_status: {
        type: DataTypes.BOOLEAN
      },
      d_uuid: {
        type: DataTypes.INTEGER
      },
      d_name: {
        type: DataTypes.STRING
      },
      u_salutation_uuid: {
        type: DataTypes.INTEGER
      },
      u_salutation_name: {
        type: DataTypes.STRING
      },
      u_first_name: {
        type: DataTypes.STRING
      },
      u_middle_name: {
        type: DataTypes.STRING
      },
      u_last_name: {
        type: DataTypes.STRING
      },
      u_is_active: {
        type: DataTypes.BOOLEAN
      },
      u_status: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      freezeTableName: true
    }
  );

  return VW_ALL_FAVOURITES;
};
