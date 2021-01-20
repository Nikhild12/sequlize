module.exports = (sequlize, DataTypes) => {

    const routes = sequlize.define(
      "routes",
      {
        uuid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        code: {
          type: DataTypes.STRING(8),
          allowNull: true
        },
        name: {
          type: DataTypes.STRING(8),
          allowNull: true
        },
        language:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        display_order:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        color:{
            type: DataTypes.STRING,
            allowNull: true
        },
        Is_default:{
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: true
  
        },
        revision: {
          type: DataTypes.INTEGER,
          allowNull: true
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
    return routes;
  
  };