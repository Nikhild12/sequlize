module.exports = (sequelize, DataTypes) => {
    const vw_emr_lab_results = sequelize.define(
        "vw_emr_lab_results", {
        po_uuid: {
            type: DataTypes.INTEGER,
        },
        po_patient_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        po_order_number: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        po_doctor_uuid: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        am_code: {
            type: DataTypes.STRING,
        },
        am_name: {
            type: DataTypes.STRING,
        },
        pwd_result_value: {
            type: DataTypes.STRING,
        },
        trm_max_value: {
            type: DataTypes.INTEGER
        },
        trm_min_value: {
            type: DataTypes.INTEGER
        },
        tm_code: {
            type: DataTypes.STRING,
        },
        tm_name: {
            type: DataTypes.STRING,
        },
        um_code: {
            type: DataTypes.STRING,
        },
        um_name: {
            type: DataTypes.STRING,
        },
        lq_code: {
            type: DataTypes.STRING,
        },
        lq_name: {
            type: DataTypes.STRING,
        },
        wos_code: {
            type: DataTypes.STRING
        },
        wos_name: {
            type: DataTypes.STRING
        }

    }, {
        tableName: "vw_emr_lab_results",
    }
    );

    return vw_emr_lab_results;
};