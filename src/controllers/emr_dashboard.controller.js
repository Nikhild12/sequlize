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
const cons_dash = sequelizeDb.vw_emr_cons_dashboard;

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
                const lab = await getlabbygenger(lab_dash, user_uuid, depertment_Id, gender);
                const rad = await getradbygender(ris_dash, user_uuid, depertment_Id, gender);
                const inv = await getinvbygender(inv_dash, user_uuid, depertment_Id, gender);
                const presc = await getprescbygender(pres_dash, user_uuid, depertment_Id, gender);
                const cons = await getconsbygender(cons_dash, user_uuid, depertment_Id, gender);

                const orders = getorders(lab, rad, inv);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diagnosis,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": orders

                    }
                });

            } else if (session > 0 && !gender && !from_date && !to_date) {
                console.log("this is session section");
                const diag = await getDiagnosisbysession(diag_dash, user_uuid, depertment_Id, session);
                const chiefc = await getchiefcbysession(chiefc_dash, user_uuid, depertment_Id, session);
                const presc = await getprescbysession(pres_dash, user_uuid, depertment_Id, session);
                const cons = await getconsbysession(cons_dash, user_uuid, depertment_Id, session);
                const lab = await getlabbysession(lab_dash, user_uuid, depertment_Id, session);
                const rad = await getradbysession(ris_dash, user_uuid, depertment_Id, session);
                const inv = await getinvbysession(inv_dash, user_uuid, depertment_Id, session);

                const orders = getorders(lab, rad, inv);
                
                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": orders

                    }
                });
            } else if (from_date && to_date && !session && !gender) {
                console.log("this is date section");
                const diag = await getDiagnosisbydate(diag_dash, user_uuid, depertment_Id, from_date, to_date);
                const chiefc = await getchiefcbydate(chiefc_dash, user_uuid, depertment_Id, from_date, to_date);
                const presc = await getprescbybydate(pres_dash, user_uuid, depertment_Id, from_date, to_date);
                const cons = await getconsbybydate(cons_dash, user_uuid, depertment_Id, from_date, to_date);
                const lab = await getlabbydate(lab_dash, user_uuid, depertment_Id, from_date, to_date);
                const rad = await getradbydate(ris_dash, user_uuid, depertment_Id, from_date, to_date);
                const inv = await getinvbydate(inv_dash, user_uuid, depertment_Id, from_date, to_date);

                const orders = getorders(lab, rad, inv);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": orders
                    }
                });
            } else if (session && from_date && to_date && gender) {
                console.log("this is all filter");
                const diag = await getdiagbyAll(diag_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                const chiefc = await getchiefbyAll(chiefc_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                const presc = await getprescbyAll(pres_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                const cons = await getconsbyAll(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                const lab = await getlabbyAll(lab_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                const rad = await getradbyAll(ris_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                const inv = await getinvbyAll(inv_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);

                const orders = getorders(lab, rad, inv);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": orders

                    }
                });
            } else if (session && !from_date && !to_date && gender) {
                console.log("this is all filter");
                const diag = await getdiagbysessiongender(diag_dash, user_uuid, depertment_Id, session, gender);
                const chiefc = await getchiefbysessiongender(chiefc_dash, user_uuid, depertment_Id, session, gender);
                const presc = await getprescbysessiongender(pres_dash, user_uuid, depertment_Id, session, gender);
                const cons = await getconsbysessiongender(cons_dash, user_uuid, depertment_Id, session, gender);
                const lab = await getlabbysessiongender(lab_dash, user_uuid, depertment_Id, session, gender);
                const rad = await getradbysessiongender(lab_dash, user_uuid, depertment_Id, session, gender);
                const inv = await getinvbysessiongender(lab_dash, user_uuid, depertment_Id, session, gender);

                const orders = getorders(lab, rad, inv);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": orders

                    }
                });
            } else if (session && from_date && to_date && !gender) {
                console.log("this is all filter");
                const diag = await getdiagbysessiondate(diag_dash, user_uuid, depertment_Id, session, from_date, to_date);
                const chiefc = await getchiefbysessiondate(chiefc_dash, user_uuid, depertment_Id, session, from_date, to_date);
                const presc = await getprescbysessiondate(pres_dash, user_uuid, depertment_Id, session, from_date, to_date);
                const cons = await getconsbysessiondate(cons_dash, user_uuid, depertment_Id, session, from_date, to_date);
                const lab = await getlabbysessiondate(lab_dash, user_uuid, depertment_Id, session, from_date, to_date);
                const rad = await getradbysessiondate(ris_dash, user_uuid, depertment_Id, session, from_date, to_date);
                const inv = await getinvbysessiondate(inv_dash, user_uuid, depertment_Id, session, from_date, to_date);

                const orders = getorders(lab, rad, inv);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": orders

                    }
                });
            } else if (!session && from_date && to_date && gender) {
                console.log("this is all filter");
                const diag = await getdiagbygenderdate(diag_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                const chiefc = await getchiefbygenderdate(chiefc_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                const presc = await getprescbygenderdate(pres_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                const cons = await getconsbygenderdate(cons_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                const lab = await getlabbygenderdate(lab_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                const rad = await getradbygenderdate(ris_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                const inv = await getinvbygenderdate(inv_dash, user_uuid, depertment_Id, gender, from_date, to_date);

                const orders = getorders(lab, rad, inv);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": orders

                    }
                });
            } else {
                console.log("this is default filter section");
                console.log(today);
                let from_date = today;
                let to_date = today;
                const diag = await getDiagnosisbytoday(diag_dash, user_uuid, depertment_Id, from_date, to_date);
                const chiefc = await getchiefcbytoday(chiefc_dash, user_uuid, depertment_Id, from_date, to_date);
                const presc = await getprescbytoday(pres_dash, user_uuid, depertment_Id, from_date, to_date);
                const cons = await getconsbytoday(cons_dash, user_uuid, depertment_Id, from_date, to_date);
                const lab = await getlabbytoday(lab_dash, user_uuid, depertment_Id, from_date, to_date);
                const rad = await getradbytoday(ris_dash, user_uuid, depertment_Id, from_date, to_date);
                const inv = await getinvbytoday(inv_dash, user_uuid, depertment_Id, from_date, to_date);

                let obj = {};

                let order = [];
                obj.lab_count = 0;
                for (let i = 0; i < lab.length; i++) {
                    obj.lab_count = obj.lab_count + lab[i].dataValues.Count;
                }

                obj.rad_count = 0;
                for (let i = 0; i < rad.length; i++) {
                    obj.rad_count = obj.rad_count + rad[i].dataValues.Count;
                }
                //order.push(Object.assign({}, obj));

                obj.inv_count = 0;
                for (let i = 0; i < inv.length; i++) {
                    obj.inv_count = obj.inv_count + inv[i].dataValues.Count;
                }
                //order.push(Object.assign({}, obj));

                obj.total_count = obj.lab_count + obj.rad_count + obj.inv_count;

                order.push(Object.assign({}, obj));

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": cons,
                        "orders": order,
                        "rad_orders": rad,
                        "inv_orders": inv,
                        "lab_orders": lab
                    }
                });
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
        attributes: ['pd_diagnosis_uuid', 'd_code', 'd_name', 'g_name',
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
        attributes: ['pcc_chief_complaint_uuid', 'cc_code', 'cc_name', 'g_name',
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
async function getlabbysession(lab_dash, user_uuid, depertment_Id, session) {

    const diag = await lab_dash.findAll({
        group: ['s_uuid'],
        attributes: ['s_name',
            [Sequelize.fn('COUNT', Sequelize.col('s_uuid')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
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
async function getinvbysession(inv_dash, user_uuid, depertment_Id, session) {

    const diag = await inv_dash.findAll({
        group: ['s_uuid'],
        attributes: ['s_name',
            [Sequelize.fn('COUNT', Sequelize.col('s_uuid')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
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
async function getradbysession(ris_dash, user_uuid, depertment_Id, session) {

    const diag = await ris_dash.findAll({
        group: ['s_uuid'],
        attributes: ['s_name',
            [Sequelize.fn('COUNT', Sequelize.col('s_uuid')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
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

        attributes: [[Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getprescbysession(pres_dash, user_uuid, depertment_Id, session) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: ['s_name',
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
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

async function getprescbybydate(pres_dash, user_uuid, depertment_Id, from_date, to_date) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            ps_prescription_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getprescbyAll(pres_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            g_uuid: gender,
            ps_prescription_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getprescbysessiondate(pres_dash, user_uuid, depertment_Id, session, from_date, to_date) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            ps_prescription_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getprescbysessiongender(pres_dash, user_uuid, depertment_Id, session, gender) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            g_uuid: gender


        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getprescbygenderdate(pres_dash, user_uuid, depertment_Id, gender, from_date, to_date) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            ps_prescription_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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


async function getDiagnosisbysession(diag_dash, user_uuid, depertment_Id, session) {

    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code','d_name', 's_name',
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
        attributes: ['pd_diagnosis_uuid','d_code', 'd_name', 'pd_performed_date',
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
        attributes: ['pd_diagnosis_uuid', 'd_code','d_name', 'g_name', 's_name', 'pd_performed_date',
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

async function getdiagbysessiongender(diag_dash, user_uuid, depertment_Id, session, gender) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code','d_name', 'g_name', 's_name',
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

async function getchiefbysessiongender(chiefc_dash, user_uuid, depertment_Id, session, gender) {
    const diag = await chiefc_dash.findAll({
        group: ['ed_patient_uuid', 'pcc_chief_complaint_uuid'],
        attributes: ['pcc_chief_complaint_uuid', 'cc_name', 'g_name', 's_name',
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

async function getdiagbysessiondate(diag_dash, user_uuid, depertment_Id, session, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code','d_name', 's_name', 'pd_performed_date',
            [Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
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

async function getchiefbysessiondate(chiefc_dash, user_uuid, depertment_Id, session, from_date, to_date) {
    const diag = await chiefc_dash.findAll({
        group: ['ed_patient_uuid', 'pcc_chief_complaint_uuid'],
        attributes: ['pcc_chief_complaint_uuid', 'cc_name', 's_name', 'pcc_performed_date',
            [Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'Count']
        ],
        order: [[Sequelize.fn('COUNT', Sequelize.col('pcc_chief_complaint_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
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

async function getdiagbygenderdate(diag_dash, user_uuid, depertment_Id, gender, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code','d_name', 'g_name', 'pd_performed_date',
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

async function getchiefbygenderdate(chiefc_dash, user_uuid, depertment_Id, gender, from_date, to_date) {
    const diag = await chiefc_dash.findAll({
        group: ['ed_patient_uuid', 'pcc_chief_complaint_uuid'],
        attributes: ['pcc_chief_complaint_uuid', 'cc_name', 'g_name', 'pcc_performed_date',
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

async function getconsbygender(cons_dash, user_uuid, depertment_Id, gender) {

    const diag = await cons_dash.findAll({

        attributes: [[Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender
        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getconsbysession(cons_dash, user_uuid, depertment_Id, session) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: ['s_name',
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
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

async function getconsbybydate(cons_dash, user_uuid, depertment_Id, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getconsbyAll(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            g_uuid: gender,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getconsbysessiondate(cons_dash, user_uuid, depertment_Id, session, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getconsbysessiongender(cons_dash, user_uuid, depertment_Id, session, gender) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            g_uuid: gender


        }
    }
    );
    if (diag && diag.length > 0) {
        return diag;
    } else {
        return {};
    }
}

async function getconsbygenderdate(cons_dash, user_uuid, depertment_Id, gender, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getlabbydate(lab_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await lab_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['lpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('lpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getradbydate(ris_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await ris_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['rpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('rpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getinvbydate(inv_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await inv_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['ipo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('ipo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getlabbyAll(lab_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
    const diag = await lab_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['lpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('lpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            s_uuid: session,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getradbyAll(ris_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
    const diag = await ris_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['rpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('rpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            s_uuid: session,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getinvbyAll(inv_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
    const diag = await inv_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['ipo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('ipo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            s_uuid: session,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getlabbysessiongender(lab_dash, user_uuid, depertment_Id, session, gender) {
    const diag = await lab_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['lpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('lpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
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
async function getradbysessiongender(ris_dash, user_uuid, depertment_Id, session, gender) {
    const diag = await ris_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['rpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('rpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
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
async function getinvbysessiongender(inv_dash, user_uuid, depertment_Id, session, gender) {
    const diag = await inv_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['ipo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('ipo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
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
async function getlabbysessiondate(lab_dash, user_uuid, depertment_Id, session, from_date, to_date) {
    const diag = await lab_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['lpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('lpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getradbysessiondate(ris_dash, user_uuid, depertment_Id, session, from_date, to_date) {
    const diag = await ris_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['rpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('rpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getinvbysessiondate(inv_dash, user_uuid, depertment_Id, session, from_date, to_date) {
    const diag = await inv_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['ipo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('ipo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getlabbygenderdate(lab_dash, user_uuid, depertment_Id, gender, from_date, to_date) {
    const diag = await lab_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['lpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('lpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getradbygenderdate(ris_dash, user_uuid, depertment_Id, gender, from_date, to_date) {
    const diag = await ris_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['rpo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('rpo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getinvbygenderdate(inv_dash, user_uuid, depertment_Id, gender, from_date, to_date) {
    const diag = await inv_dash.findAll({
        //group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['ipo_order_request_date',
            [Sequelize.fn('COUNT', Sequelize.col('ipo_order_request_date')), 'Count']
        ],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getlabbytoday(lab_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await lab_dash.findAll({
        group: ['lpo_order_request_date'],
        attributes: ['lpo_order_request_date',
            [Sequelize.fn('time', Sequelize.col('lpo_order_request_date')), 'Time'],
            [Sequelize.fn('COUNT', Sequelize.col('lpo_order_number')), 'Count'],
            //[Sequelize.fn('count', '*'), 'Count']
        ],
        //group: ['hour'],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('lpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getradbytoday(ris_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await ris_dash.findAll({
        group: ['rpo_order_request_date'],
        attributes: ['rpo_order_request_date',
            [Sequelize.fn('time', Sequelize.col('rpo_order_request_date')), 'Time'],
            [Sequelize.fn('COUNT', Sequelize.col('rpo_order_number')), 'Count'],
            //[Sequelize.fn('count', '*'), 'Count']
        ],
        //group: ['hour'],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('rpo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getinvbytoday(inv_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await inv_dash.findAll({
        group: ['ipo_order_request_date'],
        attributes: ['ipo_order_request_date',
            [Sequelize.fn('time', Sequelize.col('ipo_order_request_date')), 'Time'],
            [Sequelize.fn('COUNT', Sequelize.col('ipo_order_number')), 'Count'],
            //[Sequelize.fn('count', '*'), 'Count']
        ],
        //group: ['hour'],
        //order: [[Sequelize.fn('COUNT', Sequelize.col('pd_diagnosis_uuid')), 'DESC']],
        limit: 10,
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            lpo_order_request_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ipo_order_request_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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
async function getconsbytoday(cons_dash, user_uuid, depertment_Id, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //hour( activity_dt ) , day( activity_dt )
        group: ['ed_consultation_start_date'],
        attributes: ['ed_consultation_start_date',
            //[Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            [Sequelize.fn('time', Sequelize.col('ed_consultation_start_date')), 'Time'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        //group: ['hour'],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getprescbytoday(pres_dash, user_uuid, depertment_Id, from_date, to_date) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        ],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            ps_prescription_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '>=', moment(from_date).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ps_prescription_date')), '<=', moment(to_date).format('YYYY-MM-DD'))
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

async function getDiagnosisbytoday(diag_dash, user_uuid, depertment_Id, from_date, to_date) {
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

async function getchiefcbytoday(chiefc_dash, user_uuid, depertment_Id, from_date, to_date) {
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

function getorders(lab, rad, inv) {
    let orders = {};
    if (lab.length > 0) {
        orders.lab_count = lab[0].dataValues.Count;
    } else {
        orders.lab_count = 0;
    }
    if (rad.length > 0) {
        orders.rad_count = rad[0].dataValues.Count;
    } else {
        orders.rad_count = 0;
    }
    if (inv.length > 0) {
        orders.inv_count = inv[0].dataValues.Count;
    } else {
        orders.inv_count = 0;
    }
    //orders.gender = lab[0].dataValues.g_name;

    return orders;
}