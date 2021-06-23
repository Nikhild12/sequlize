module.exports = (sequelize, DataTypes) => {
  const clinical_notes = sequelize.define(
    'clinical_notes', {
    uuid: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    facility_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    department_uuid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    consultation_uuid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    patient_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    encounter_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    encounter_type_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    captured_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    captured_on: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    daily_note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    special_note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    note_type_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    note_status_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    is_ventilator: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_cpap: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_bipap: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_apap: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_o2_con: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_o2: {
      type: DataTypes.BOOLEAN,
      allowNull: true
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
    created_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    modified_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'clinical_notes',
    createdAt: 'created_date',
    updatedAt: 'modified_date',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uuid" },
        ]
      },]
  });

  return clinical_notes;
};