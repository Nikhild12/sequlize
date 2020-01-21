module.exports = (sequelize, DataTypes) => {
    const VW_FAVOURITE_INVESTIGATION = sequelize.define(
      "vw_favourite_investigation",
      {
        fm_uuid: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        fm_name: {
          type: DataTypes.STRING(255)
        },
        fm_dept: {
          type: DataTypes.INTEGER
        },
        fm_userid: {
          type: DataTypes.INTEGER
        },
        fm_favourite_type_uuid: {
          type: DataTypes.INTEGER
        },
        fm_active: {
          type: DataTypes.BOOLEAN
        },
        fm_public: {
          type: DataTypes.BOOLEAN
        },
        fm_status: {
          type: DataTypes.BOOLEAN
        },
        fm_display_order: {
          type: DataTypes.INTEGER
        },
        ivtm_uuid: {
          type: DataTypes.INTEGER
        },
        ivtm_code: {
          type: DataTypes.INTEGER
        },
        ivtm_name: {
          type: DataTypes.INTEGER
        },
        ivtm_description: {
          type: DataTypes.INTEGER
        }
      },
      {
        freezeTableName: true
      }
    );
  
    return VW_FAVOURITE_INVESTIGATION;
  };
  