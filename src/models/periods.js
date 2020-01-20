

module.exports = (sequelize, DataTypes) => {
  const periods = sequelize.define(
      "periods", {
          uuid: {
              type: DataTypes.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true
          },
          code: {
              type: DataTypes.STRING(50),
              allowNull: true
          },
          name: {
              type: DataTypes.STRING(100),
              allowNull: true
          },
          color: {
              type: DataTypes.STRING(15),
              allowNull: true
          },
          language: {
              type: DataTypes.INTEGER,
              allowNull: true
          },
         
          display_order: {
              type: DataTypes.INTEGER,
              allowNull: true
          },
          Is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: true

         },
          is_active: {
              type: DataTypes.BOOLEAN,
              defaultValue: 1,
              allowNull: false

          },
          status: {
            
            type: DataTypes.BOOLEAN,
            defaultValue: 1,
            allowNull: false

        },
        revision: {
            
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false

        },
          created_by: {
              type: DataTypes.INTEGER,
              allowNull: false,
              defaultValue: 0,

          },
         
          modified_by: {
              type: DataTypes.INTEGER,
              allowNull: false,
              defaultValue: 0,

          },
          
      }, {
          tableName: 'periods',
          createdAt: 'created_date',
          updatedAt: 'modified_date',
          indexes: [{
              fields: ["uuid"]
          }]
      }
  );
  

  return periods;
};