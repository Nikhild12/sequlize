const httpStatus = require('http-status');
const moment = require('moment');
var Sequelize = require('sequelize');
//Sequlize Import 
const sequelizeDb = require('../config/sequelize');
const config = require('../config/config');
var Op = Sequelize.Op;
const emr_utility = require('../services/utility.service');

const rp = require('request-promise');

//Intialize Tables
//const dashboard_tbl = sequelizeDb.vw_emr_dashboard_details;
const ris_dash = sequelizeDb.vw_emr_ris_dashboard;
const pres_dash = sequelizeDb.vw_emr_prescription_dashboard;
const lab_dash = sequelizeDb.vw_emr_lab_dashboard;
const inv_dash = sequelizeDb.vw_emr_inv_dashboard;
const diag_dash = sequelizeDb.vw_emr_diagnosis_dashboard;
const chiefc_dash = sequelizeDb.vw_emr_chief_complaint_dashboard;

const EmrDashBoard = () => {
    /**
     * @param {*} req
     * @param {*} res
     */


    const _getDashBoard = async (req, res) => {
        const { user_uuid } = req.headers;
        const { depertment_Id, from_date, to_date, gender, session } = req.query;
        const today = moment(new Date()).format('YYYY-MM-DD');

        if (!user_uuid) {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
        }
        try {

            if (gender > 0 && !session && !from_date && !to_date) {
                console.log("this is gender section");

                const diagnosis = await getDiagnosisbygenger(diag_dash, user_uuid, depertment_Id, gender);
                const chiefc = await getchiefbygenger(chiefc_dash, user_uuid, depertment_Id, gender);
                //const lab = await getlabbygenger(lab_dash, user_uuid, depertment_Id, gender);
                //const rad = await getradbygender(ris_dash, user_uuid, depertment_Id, gender);
                //const inv = await getinvbygender(inv_dash, user_uuid, depertment_Id, gender);
                //const presc = await getprescbygender(pres_dash, user_uuid, depertment_Id, gender);

                // let orders = {};

                // orders.gender = lab[0].dataValues.g_name || rad[0].dataValues.g_name || inv[0].dataValues.g_name;
                // orders.lab_count = lab[0].dataValues.Count;
                // //orders.radiology_count = rad[0].dataValues.Count;
                // orders.investigation_count = inv[0].dataValues.Count;

                // let pres = {};
                // pres.male = 0;
                // pres.female = 0;
                // pres.transgender = 0;

                // if (gender == 1) {
                //     pres.male = presc[0].dataValues.Count;
                // } else if (gender == 2) {
                //     pres.female = presc[0].dataValues.Count;
                // } else {
                //     pres.transgender = presc[0].dataValues.Count;
                // }

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis:": diagnosis,
                        "cieif_complaints": chiefc,

                    }
                });

            } else if (session > 0 && !gender && !from_date && !to_date) {
                console.log("this is session section");
                const diag = await getDiagnosisbysession(diag_dash, user_uuid, depertment_Id, session);
                const chiefc = await getchiefcbysession(chiefc_dash, user_uuid, depertment_Id, session);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis:": diag,
                        "cieif_complaints": chiefc,

                    }
                });
            } else if (from_date && to_date && !session && !gender) {
                console.log("this is date section");
                const diag = await getDiagnosisbydate(diag_dash, user_uuid, depertment_Id, from_date, to_date);
                const chiefc = await getchiefcbydate(chiefc_dash, user_uuid, depertment_Id, from_date, to_date);
                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis:": diag,
                        "cieif_complaints": chiefc,

                    }
                });
            }
            else if (session && from_date && to_date && gender) {
                console.log ("this is all filter");
                const diag = await getdiagbyAll(diag_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                const chiefc = await getchiefbyAll(chiefc_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                
                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis:": diag,
                        "cieif_complaints": chiefc,

                    }
                });
            }
            else {
                console.log("this is default filter section");
            }

        } catch (ex) {
            console.log(ex);
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex });
        }
    };
    return {
        getDashBoard: _getDashBoard
    };
};

module.exports = EmrDashBoard();

async function getDiagnosisbygenger(diag_dash, user_uuid, depertment_Id, gender) {

    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_name', 'g_name',
            [Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getchiefbygenger(chiefc_dash, user_uuid, depertment_Id, gender) {

    const diag = await chiefc_dash.findAll({
        group: ['ed_patient_uuid', 'pcc_chief_complaint_uuid'],
        attributes: ['pcc_chief_complaint_uuid', 'cc_name', 'g_name',
            [Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getlabbygenger(lab_dash, user_uuid, depertment_Id, gender) {

    const diag = await lab_dash.findAll({
        group: ['g_uuid'],
        attributes: ['g_name',
            [Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'DESC']],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return [];
    }
}

async function getradbygender(ris_dash, user_uuid, depertment_Id, gender) {

    const diag = await ris_dash.findAll({
        group: ['g_uuid'],
        attributes: ['g_name',
            [Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'DESC']],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getinvbygender(inv_dash, user_uuid, depertment_Id, gender) {

    const diag = await inv_dash.findAll({
        group: ['g_uuid'],
        attributes: ['g_name',
            [Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'DESC']],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getprescbygender(pres_dash, user_uuid, depertment_Id, gender) {

    const diag = await pres_dash.findAll({
        group: ['g_uuid'],
        attributes: ['g_name',
            [Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('g_uuid')), 'DESC']],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getDiagnosisbysession(diag_dash, user_uuid, depertment_Id, session) {

    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_name', 's_name',
            [Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session
        }
    }
    );

    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getchiefcbysession(chiefc_dash, user_uuid, depertment_Id, session) {
    const diag = await chiefc_dash.findAll({
        group: ['ed_patient_uuid', 'pcc_chief_complaint_uuid'],
        attributes: ['pcc_chief_complaint_uuid', 'cc_name', 's_name',
            [Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session
        }
    }
    );

    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getDiagnosisbydate(diag_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_name', 'pd_performed_date',
            [Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            pd_performed_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pd_performed_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pd_performed_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
                ]
            }
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }

}

async function getchiefcbydate(chiefc_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await chiefc_dash.findAll({
        group: ['ed_patient_uuid', 'pcc_chief_complaint_uuid'],
        attributes: ['pcc_chief_complaint_uuid', 'cc_name', 'pcc_performed_date',
            [Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            pcc_performed_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pcc_performed_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pcc_performed_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
                ]
            }
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }

}

async function getdiagbyAll(diag_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_name', 'g_name', 's_name', 'pd_performed_date',
            [Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender,
            s_uuid: session,
            pd_performed_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pd_performed_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pd_performed_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
                ]
            }
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }

}

async function getchiefbyAll(chiefc_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
    const diag = await chiefc_dash.findAll({
        group: ['ed_patient_uuid', 'pcc_chief_complaint_uuid'],
        attributes: ['pcc_chief_complaint_uuid', 'cc_name', 'g_name', 's_name', 'pcc_performed_date',
            [Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            p_gender_uuid: gender,
            s_uuid: session,
            pcc_performed_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pcc_performed_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('pcc_performed_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
                ]
            }
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }

}