module.exports = (sequelize, DataTypes) => {
    const vw_vitals_master = sequelize.define(
        "vw_vitals_master",
        {
            uuid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            vital_type_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            description: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            mnemonic: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            loinc_code_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            uom_master_uuid: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            vital_value_type_uuid: {
                type: DataTypes.INTEGER,

            },
            reference_range_from: {
                type: DataTypes.DATE,
                allowNull: true
            },
            reference_range_to: {
                type: DataTypes.DATE,
                allowNull: true
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,

            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: 1,

            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            modified_by: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            created_date: {
                type: DataTypes.STRING
            },
            modified_date: {
                type: DataTypes.STRING
            },
            vt_uuid:{
                type: DataTypes.INTEGER,
            },
            vt_code:{
                type: DataTypes.STRING(50)
            },
            vt_name:{
                type: DataTypes.STRING(50)
            },
            vvt_uuid:{
                type: DataTypes.INTEGER,
            },
            vvt_code:{
                type: DataTypes.STRING(50)
            },
            vvt_name:{
                type: DataTypes.STRING(50)
            },
            um_code: {
                type: DataTypes.STRING(50),
            },
            um_name: {
                type: DataTypes.STRING(50),
            },
            lm_code: {
                type: DataTypes.STRING(50),
            },
            lm_name: {
                type: DataTypes.STRING(50),
            },
            u_first_name: {
                type: DataTypes.STRING(255),
            },
            u_middle_name: {
                type: DataTypes.STRING(255),
            },
            u_last_name: {
                type: DataTypes.STRING(255),
            },
            m_first_name: {
                type: DataTypes.STRING(255),
            },
            m_middle_name: {
                type: DataTypes.STRING(255),
            },
            m_last_name: {
                type: DataTypes.STRING(255),
            },

        },
        {
            freezeTableName: true,
        }
    );

    return vw_vitals_master;
};