const emr_constants = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const TICK_SHEET_MASTER_DETAILS = sequelize.define(
    "favourite_master_details",
    {
      uuid: {
        type: DataTypes.INTEGER,
        // allowNull : false,
        primaryKey: true,
        autoIncrement: true,
      },
      favourite_master_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      test_master_type_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
          min: 0,
        },
      },

      test_master_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      profile_master_uuid: {
        type: DataTypes.INTEGER
      },
      item_master_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      chief_complaint_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vital_master_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      diagnosis_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      drug_route_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },

      drug_frequency_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      duration: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      duration_period_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      treatment_kit_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      diet_master_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      diet_category_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      diet_frequency_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      drug_instruction_uuid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      strength: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      group_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      group_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      display_order: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 0
      },
      comments: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      speciality_sketch_uuid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      created_date: "created_date",
      modified_date: "modified_date",

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      modified_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      injection_room_uuid: {
        type: DataTypes.INTEGER
      }
    },
    {
      freezeTableName: true,
      timestamps: false,
      createAt: "created_date",
      updatedAt: "modified_date",
    }
  );

  TICK_SHEET_MASTER_DETAILS.associate = (models) => {
    TICK_SHEET_MASTER_DETAILS.belongsTo(models.favourite_master, {
      foreignKey: "favourite_master_uuid",
    });

    TICK_SHEET_MASTER_DETAILS.belongsTo(models.speciality_sketches, {
      foreignKey: "speciality_sketch_uuid",
    });
  };

  return TICK_SHEET_MASTER_DETAILS;
};
