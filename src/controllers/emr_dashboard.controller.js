// HttpStatus Import
const httpStatus = require('http-status');

// Moment Import
const moment = require('moment');

// Sequelize Import
const Sequelize = require('sequelize');

// Config Sequlize Import 
const sequelizeDb = require('../config/sequelize');

const Op = Sequelize.Op;

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
        const { user_uuid, facility_uuid } = req.headers;
        const { depertment_Id, from_date, to_date, gender, session } = req.query;
        const today = moment(new Date()).format('YYYY-MM-DD');
        const hour = 'hour'; const date = 'date';

        if (!user_uuid) {
            return res.status(400).send({ code: httpStatus.UNAUTHORIZED, message: `${emr_constants.NO} ${emr_constants.NO_USER_ID} ${emr_constants.OR} ${emr_constants.NO_REQUEST_PARAM} ${emr_constants.FOUND}` });
        }
        try {

            if (from_date && to_date && !session && !gender) {
                // This is Date Section
                if (from_date === today && to_date === today) {
                    const diag = await getDiagnosisbytoday(diag_dash, user_uuid, depertment_Id, from_date, to_date);
                    const chiefc = await getchiefcbytoday(chiefc_dash, user_uuid, depertment_Id, from_date, to_date);
                    const presc = await getprescbytoday(pres_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid);
                    const cons = await getconsbytoday(cons_dash, user_uuid, depertment_Id, from_date, to_date);
                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour);
                    const consd = await getconstoday(cons_dash, user_uuid, depertment_Id, from_date, to_date);

                    let obj = {};
                    obj.lab_count = 0;
                    for (let i = 0; i < lab.length; i++) {
                        obj.lab_count = obj.lab_count + lab[i].dataValues.Count;
                    }

                    obj.rad_count = 0;
                    for (let i = 0; i < rad.length; i++) {
                        obj.rad_count = obj.rad_count + rad[i].dataValues.Count;
                    }

                    obj.inv_count = 0;
                    for (let i = 0; i < inv.length; i++) {
                        obj.inv_count = obj.inv_count + inv[i].dataValues.Count;
                    }

                    obj.total_count = obj.lab_count + obj.rad_count + obj.inv_count;

                    const lab_order = gethours(lab);
                    const rad_order = gethours(rad);
                    const inv_order = gethours(inv);
                    const orders_graph = getordershr(lab_order, rad_order, inv_order);
                    const cons_graph = gethourscons(cons);

                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": consd,
                            "orders": obj,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph
                        }
                    });
                }
                else {
                    const diag = await getDiagnosisbydate(diag_dash, user_uuid, depertment_Id, from_date, to_date);
                    const chiefc = await getchiefcbydate(chiefc_dash, user_uuid, depertment_Id, from_date, to_date);
                    const presc = await getprescbybydate(pres_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid);
                    const cons = await getconsbybydate(cons_dash, user_uuid, depertment_Id, from_date, to_date);
                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date);
                    const cons_graph = await getconsgraphbydate(cons_dash, user_uuid, depertment_Id, from_date, to_date);
                    const orders_graph = getordergraphbydate(lab, rad, inv, from_date, to_date);
                    const orders = getorders(lab, rad, inv);
                    console.log(orders_graph);
                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": cons,
                            "orders": orders,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph
                        }
                    });
                }
            } else if (session && from_date && to_date && gender) {
                // This is all filter
                if (from_date === today && to_date === today) {
                    const diag = await getDiagnosisbytodayAll(diag_dash, user_uuid, depertment_Id, session, gender, from_date, to_date, facility_uuid);
                    const chiefc = await getchiefcbytodayAll(chiefc_dash, user_uuid, depertment_Id, session, gender, from_date, to_date, facility_uuid);
                    const presc = await getprescbyAll(pres_dash, user_uuid, depertment_Id, session, gender, from_date, to_date, facility_uuid);
                    const cons = await getconstodayAll(cons_dash, user_uuid, depertment_Id, from_date, to_date, session, gender, facility_uuid);

                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, gender, session);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, gender, session);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, gender, session);
                    const consd = await getconsbyAll(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date, facility_uuid);

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

                    obj.inv_count = 0;
                    for (let i = 0; i < inv.length; i++) {
                        obj.inv_count = obj.inv_count + inv[i].dataValues.Count;
                    }

                    obj.total_count = obj.lab_count + obj.rad_count + obj.inv_count;

                    const lab_order = gethours(lab);
                    const rad_order = gethours(rad);
                    const inv_order = gethours(inv);
                    const orders_graph = getordershr(lab_order, rad_order, inv_order);
                    const cons_graph = gethourscons(cons);

                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": consd,
                            "orders": obj,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph
                        }
                    });
                } else {
                    const diag = await getdiagbyAll(diag_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                    const chiefc = await getchiefbyAll(chiefc_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                    const presc = await getprescbyAll(pres_dash, user_uuid, depertment_Id, session, gender, from_date, to_date, facility_uuid);
                    const cons = await getconsbyAll(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);
                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, gender, session);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, gender, session);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, gender, session);
                    const cons_graph = await getconsgraphbydateAll(cons_dash, user_uuid, depertment_Id, from_date, to_date, session, gender);
                    const orders_graph = getordergraphbydate(lab, rad, inv, from_date, to_date);
                    const orders = getorders(lab, rad, inv);

                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": cons,
                            "orders": orders,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph

                        }
                    });
                }
            } else if (session && from_date && to_date && !gender) {
                // This is all Filter
                if (from_date === today && to_date === today) {
                    const diag = await getdiagbysessiondate(diag_dash, user_uuid, depertment_Id, session, from_date, to_date);
                    const chiefc = await getchiefbysessiondate(chiefc_dash, user_uuid, depertment_Id, session, from_date, to_date);
                    const presc = await getprescbysessiondate(pres_dash, user_uuid, depertment_Id, session, from_date, to_date, facility_uuid);
                    const cons = await getconssessiondatetoday(cons_dash, user_uuid, depertment_Id, session, from_date, to_date);
                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, 0, session);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, 0, session);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, 0, session);
                    const consd = await getconsbysessiondatetoday(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);

                    let obj = {};
                    obj.lab_count = 0;
                    for (let i = 0; i < lab.length; i++) {
                        obj.lab_count = obj.lab_count + lab[i].dataValues.Count;
                    }

                    obj.rad_count = 0;
                    for (let i = 0; i < rad.length; i++) {
                        obj.rad_count = obj.rad_count + rad[i].dataValues.Count;
                    }

                    obj.inv_count = 0;
                    for (let i = 0; i < inv.length; i++) {
                        obj.inv_count = obj.inv_count + inv[i].dataValues.Count;
                    }

                    obj.total_count = obj.lab_count + obj.rad_count + obj.inv_count;

                    const lab_order = gethours(lab);
                    const rad_order = gethours(rad);
                    const inv_order = gethours(inv);
                    const orders_graph = getordershr(lab_order, rad_order, inv_order);
                    const cons_graph = gethourscons(cons);

                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": consd,
                            "orders": obj,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph
                        }
                    });


                } else {
                    const diag = await getdiagbysessiondate(diag_dash, user_uuid, depertment_Id, session, from_date, to_date);
                    const chiefc = await getchiefbysessiondate(chiefc_dash, user_uuid, depertment_Id, session, from_date, to_date);
                    const presc = await getprescbysessiondate(pres_dash, user_uuid, depertment_Id, session, from_date, to_date, facility_uuid);
                    const cons = await getconsbysessiondate(cons_dash, user_uuid, depertment_Id, session, from_date, to_date);
                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, 0, session);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, 0, session);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, 0, session);
                    const cons_graph = await getconsgraphbysessiondateAll(cons_dash, user_uuid, depertment_Id, from_date, to_date, session, gender);
                    const orders_graph = getordergraphbydate(lab, rad, inv, from_date, to_date);
                    const orders = getorders(lab, rad, inv);

                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": cons,
                            "orders": orders,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph

                        }
                    });
                }
            } else if (!session && from_date && to_date && gender) {

                // This is all Filter
                if (from_date === today && to_date === today) {
                    const diag = await getdiagbygenderdate(diag_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                    const chiefc = await getchiefbygenderdate(chiefc_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                    const presc = await getprescbygenderdate(pres_dash, user_uuid, depertment_Id, gender, from_date, to_date, facility_uuid);
                    const cons = await getconsbygendertoday(cons_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, gender);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, gender);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour, gender);
                    const consd = await getconsbygenderdatetoday(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date);

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

                    obj.inv_count = 0;
                    for (let i = 0; i < inv.length; i++) {
                        obj.inv_count = obj.inv_count + inv[i].dataValues.Count;
                    }

                    obj.total_count = obj.lab_count + obj.rad_count + obj.inv_count;

                    const lab_order = gethours(lab);
                    const rad_order = gethours(rad);
                    const inv_order = gethours(inv);
                    const orders_graph = getordershr(lab_order, rad_order, inv_order);
                    const cons_graph = gethourscons(cons);

                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": consd,
                            "orders": obj,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph
                        }
                    });

                } else {
                    const diag = await getdiagbygenderdate(diag_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                    const chiefc = await getchiefbygenderdate(chiefc_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                    const presc = await getprescbygenderdate(pres_dash, user_uuid, depertment_Id, gender, from_date, to_date, facility_uuid);
                    const cons = await getconsbygenderdate(cons_dash, user_uuid, depertment_Id, gender, from_date, to_date);
                    const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, gender);
                    const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, gender);
                    const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, date, gender);
                    const cons_graph = await getconsgraphbygenderdateAll(cons_dash, user_uuid, depertment_Id, from_date, to_date, session, gender);
                    const orders_graph = getordergraphbydate(lab, rad, inv, from_date, to_date);
                    const orders = getorders(lab, rad, inv);

                    return res.status(200).send({
                        code: httpStatus.OK, message: 'Fetched Successfully',
                        responseContents: {
                            "diagnosis": diag,
                            "cieif_complaints": chiefc,
                            "prescription": presc,
                            "consulted": cons,
                            "orders": orders,
                            "cons_graph": cons_graph,
                            "orders_graph": orders_graph

                        }
                    });
                }
            } else {

                // This is default filter

                let from_date = today;
                let to_date = today;
                const diag = await getDiagnosisbytoday(diag_dash, user_uuid, depertment_Id, from_date, to_date);
                const chiefc = await getchiefcbytoday(chiefc_dash, user_uuid, depertment_Id, from_date, to_date);
                const presc = await getprescbytoday(pres_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid);
                const cons = await getconsbytoday(cons_dash, user_uuid, depertment_Id, from_date, to_date);
                const lab = await getLabCount(lab_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour);
                const rad = await getRadiologyCount(ris_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour);
                const inv = await getInvestigationCount(inv_dash, user_uuid, depertment_Id, from_date, to_date, facility_uuid, hour);
                const consd = await getconstoday(cons_dash, user_uuid, depertment_Id, from_date, to_date);

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
                obj.inv_count = 0;
                for (let i = 0; i < inv.length; i++) {
                    obj.inv_count = obj.inv_count + inv[i].dataValues.Count;
                }
                obj.total_count = obj.lab_count + obj.rad_count + obj.inv_count;


                const lab_order = gethours(lab);
                const rad_order = gethours(rad);
                const inv_order = gethours(inv);
                const orders_graph = getordershr(lab_order, rad_order, inv_order);
                const cons_graph = gethourscons(cons);

                return res.status(200).send({
                    code: httpStatus.OK, message: 'Fetched Successfully',
                    responseContents: {
                        "diagnosis": diag,
                        "cieif_complaints": chiefc,
                        "prescription": presc,
                        "consulted": consd,
                        "orders": obj,
                        "cons_graph": cons_graph,
                        "orders_graph": orders_graph
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

/**
 * Prescription Query Starts
 */
async function getprescbybydate(pres_dash, user_uuid, depertment_Id, from_date, to_date, facility_id) {

    const diag = await pres_dash.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ps_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ps_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ps_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        where: {
            ps_doctor_uuid: user_uuid,
            ps_status: 1,
            ps_is_active: 1,
            ps_department_uuid: depertment_Id,
            ps_facility_uuid: facility_id,
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
        return [];
    }
} // Changed Presc on 25.05


async function getprescbytoday(pres_dash, user_uuid, depertment_Id, from_date, to_date, facility_id) {

    const diag = await pres_dash.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ps_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ps_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ps_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        where: {
            ps_doctor_uuid: user_uuid,
            ps_status: 1,
            ps_is_active: 1,
            ps_department_uuid: depertment_Id,
            ps_facility_uuid: facility_id,
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
        return [];
    }
} // Changed Presc on 25.05

async function getprescbyAll(pres_dash, user_uuid, depertment_Id, session, gender, from_date, to_date, facility_id) {

    const diag = await pres_dash.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ps_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ps_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ps_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        where: {
            ps_doctor_uuid: user_uuid,
            ps_status: 1,
            ps_is_active: 1,
            ps_department_uuid: depertment_Id,
            ps_facility_uuid: facility_id,
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
        return [];
    }
} // Changed Presc on 25.05

async function getprescbysessiondate(pres_dash, user_uuid, depertment_Id, session, from_date, to_date, facility_id) {

    const diag = await pres_dash.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ps_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ps_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ps_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        where: {
            ps_doctor_uuid: user_uuid,
            ps_status: 1,
            ps_is_active: 1,
            ps_department_uuid: depertment_Id,
            ps_facility_uuid: facility_id,
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
        return [];
    }
} // Changed Presc on 25.05

async function getprescbygenderdate(pres_dash, user_uuid, depertment_Id, gender, from_date, to_date, facility_id) {

    const diag = await pres_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ps_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ps_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ps_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],

        where: {
            ps_doctor_uuid: user_uuid,
            ps_status: 1,
            ps_is_active: 1,
            ps_department_uuid: depertment_Id,
            ps_facility_uuid: facility_id,
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
        return [];
    }
} // Changed Presc on 25.05

// Prescription Query Ends

async function getDiagnosisbydate(diag_dash, user_uuid, depertment_Id, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code', 'd_name', 'pd_performed_date',
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
        return [];
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
        return [];
    }

}

async function getdiagbyAll(diag_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code', 'd_name', 'g_name', 's_name', 'pd_performed_date',
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
        return [];
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
        return [];
    }

}
async function getdiagbysessiondate(diag_dash, user_uuid, depertment_Id, session, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code', 'd_name', 's_name', 'pd_performed_date',
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
        return [];
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
        return [];
    }

}

async function getdiagbygenderdate(diag_dash, user_uuid, depertment_Id, gender, from_date, to_date) {
    const diag = await diag_dash.findAll({
        group: ['ed_patient_uuid', 'pd_diagnosis_uuid'],
        attributes: ['pd_diagnosis_uuid', 'd_code', 'd_name', 'g_name', 'pd_performed_date',
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
        return [];
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
        return [];
    }

}

async function getconsbybydate(cons_dash, user_uuid, depertment_Id, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
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
        return [];
    }
}

async function getconsbyAll(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            //[Sequelize.fn(hour, Sequelize.col('ed_consultation_start_date')), hour],
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
        return [];
    }
}

async function getconsbysessiondate(cons_dash, user_uuid, depertment_Id, session, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
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
        return [];
    }
}

async function getconsbygendertoday(cons_dash, user_uuid, depertment_Id, gender, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['hour'],
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
        return [];
    }
}
async function getconsbygenderdate(cons_dash, user_uuid, depertment_Id, gender, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
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
        return [];
    }
}

const getCountQuery = (uId, dId, fDate, tDate, fId, gBy, gen, ses, key, dateCol) => {

    const group = gBy === 'date' ? ['date'] : ['hour'];
    const attributes = [
        dateCol,
        [Sequelize.fn('date', Sequelize.col(dateCol)), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col(dateCol)), 'Count']
    ];

    if (gBy === 'hour') {
        attributes[1] = [Sequelize.fn('hour', Sequelize.col(dateCol)), 'hour'];
    }
    const where = {
        [`${key}_doctor_uuid`]: uId,
        [`${key}_status`]: 1,
        [`${key}_is_active`]: 1,
        [`${key}_department_uuid`]: dId,
        [`${key}_facility_uuid`]: fId,
        [dateCol]: {
            [Op.and]: [
                Sequelize.where(Sequelize.fn('date', Sequelize.col(dateCol)), '>=', moment(fDate).format('YYYY-MM-DD')),
                Sequelize.where(Sequelize.fn('date', Sequelize.col(dateCol)), '<=', moment(tDate).format('YYYY-MM-DD'))
            ]
        }
    };

    if (gen) {
        where.g_uuid = gen;
    }
    if (ses) {
        where.s_uuid = ses;
    }

    return { attributes, group, where };
};

/**
 * Lab Start
 * @param {*} view  View name "vw_emr_lab_dashboard"
 * @param {*} uId   user Id
 * @param {*} dId   department Id
 * @param {*} fDate from Date
 * @param {*} tDate to date
 * @param {*} gBy   group by
 * @param {*} gen   gender Id
 * @param {*} ses   session Id
 */
async function getLabCount(view, uId, dId, fDate, tDate, fId, gBy, gen = 0, ses = 0) {

    const diag = await view.findAll(
        getCountQuery(uId, dId, fDate, tDate, fId, gBy, gen, ses, 'po', 'lpo_order_request_date'));
    return diag && diag.length > 0 ? diag : {};
} // Lab Ends

/**
 * Investigation Start hour
 * @param {*} view  View name "vw_emr_inv_dashboard"
 * @param {*} uId   user Id
 * @param {*} dId   department Id
 * @param {*} fDate from Date
 * @param {*} tDate to date
 * @param {*} gBy   group by
 * @param {*} gen   gender Id
 * @param {*} ses   session Id
 */
async function getInvestigationCount(view, uId, dId, fDate, tDate, fId, gBy, gen = 0, ses = 0) {
    const diag = await view.findAll(
        getCountQuery(uId, dId, fDate, tDate, fId, gBy, gen, ses, 'ipo', 'ipo_order_request_date'));
    return diag && diag.length > 0 ? diag : {};

} // Investigation Ends

/**
 * Radiology Starts
 * @param {*} view  View Name "vw_emr_ris_dashboard"
 * @param {*} uId   userId i.e doctor id
 * @param {*} dId   departmentId
 * @param {*} fDate from Date
 * @param {*} tDate to Date
 * @param {*} fId   to facility Id
 * @param {*} gBy   Group By
 * @param {*} gen   Gender and it's optional
 * @param {*} ses   Session Id and it's optional
 */
async function getRadiologyCount(view, uId, dId, fDate, tDate, fId, gBy, gen = 0, ses = 0) {
    const diag = await view.findAll(
        getCountQuery(uId, dId, fDate, tDate, fId, gBy, gen, ses, 'rpo', 'rpo_order_request_date'));
    return diag && diag.length > 0 ? diag : {};
} // Radiology Ends

async function getconsbytoday(cons_dash, user_uuid, depertment_Id, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //hour( activity_dt ) , day( activity_dt )
        //group: ['ed_consultation_start_date'],
        attributes: ['ed_consultation_start_date',
            //[Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            [Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['hour'],
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
        return [];
    }
}

async function getconstoday(cons_dash, user_uuid, depertment_Id, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //hour( activity_dt ) , day( activity_dt )
        //group: ['ed_consultation_start_date'],
        attributes: [
            //[Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            //[Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
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
        return [];
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
        return [];
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
        return [];
    }
}

function getorders(lab, rad, inv) {
    let orders = {};
    orders.lab_count = 0; orders.rad_count = 0; orders.inv_count = 0;
    if (lab.length > 0) {
        for (let i = 0; i < lab.length; i++) {
            orders.lab_count = orders.lab_count + lab[i].dataValues.Count;
        }
    } else {
        orders.lab_count = 0;
    }
    if (rad.length > 0) {
        for (let i = 0; i < rad.length; i++) {
            orders.rad_count = orders.rad_count + rad[i].dataValues.Count;
        }
    } else {
        orders.rad_count = 0;
    }
    if (inv.length > 0) {
        for (let i = 0; i < inv.length; i++) {
            orders.inv_count = orders.inv_count + inv[i].dataValues.Count;
        }
    } else {
        orders.inv_count = 0;
    }
    orders.total_count = orders.lab_count + orders.rad_count + orders.inv_count;

    return orders;
}

function gethours(data) {
    //console.log (data);
    let lab_obj = {
        "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0,
        "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0,
        "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0
    };
    for (let i = 0; i < data.length; i++) {
        if (data[i].dataValues.hour === 0) {
            lab_obj["0"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 1) {
            lab_obj["1"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 2) {
            lab_obj["2"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 3) {
            lab_obj["3"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 4) {
            lab_obj["4"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 5) {
            lab_obj["5"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 6) {
            lab_obj["6"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 7) {
            lab_obj["7"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 8) {
            lab_obj["8"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 9) {
            lab_obj["9"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 10) {
            lab_obj["10"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 11) {
            lab_obj["11"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 12) {
            lab_obj["12"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 13) {
            lab_obj["13"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 14) {
            lab_obj["14"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 15) {
            lab_obj["15"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 16) {
            lab_obj["16"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 17) {
            lab_obj["17"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 18) {
            lab_obj["18"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 19) {
            lab_obj["19"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 20) {
            lab_obj["20"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 21) {
            lab_obj["21"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 22) {
            lab_obj["22"] = data[i].dataValues.Count;
        }
        if (data[i].dataValues.hour === 23) {
            lab_obj["23"] = data[i].dataValues.Count;
        }
    }
    return lab_obj;
}

function gethourscons(data) {
    console.log(data);
    let lab_obj = {
        "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0,
        "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0,
        "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0
    };
    for (let i = 0; i < data.length; i++) {
        if (data[i].dataValues.hour === 0) {
            lab_obj["0"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 1) {
            lab_obj["1"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 2) {
            lab_obj["2"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 3) {
            lab_obj["3"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 4) {
            lab_obj["4"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 5) {
            lab_obj["5"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 6) {
            lab_obj["6"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 7) {
            lab_obj["7"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 8) {
            lab_obj["8"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 9) {
            lab_obj["9"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 10) {
            lab_obj["10"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 11) {
            lab_obj["11"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 12) {
            lab_obj["12"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 13) {
            lab_obj["13"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 14) {
            lab_obj["14"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 15) {
            lab_obj["15"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 16) {
            lab_obj["16"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 17) {
            lab_obj["17"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 18) {
            lab_obj["18"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 19) {
            lab_obj["19"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 20) {
            lab_obj["20"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 21) {
            lab_obj["21"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 22) {
            lab_obj["22"] = data[i].dataValues.Tot_Count;
        }
        if (data[i].dataValues.hour === 23) {
            lab_obj["23"] = data[i].dataValues.Tot_Count;
        }
    }

    return lab_obj;
}

function getordershr(lab_order, rad_order, inv_order) {
    let obj = {
        // "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0,
        // "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0,
        // "16": 0, "17": 0, "18": 0, "19": 0, "20": 0, "21": 0, "22": 0, "23": 0
    };

    //for (let i = 0; i < 23; i++) {
    /* if (lab_order[0].dataValues.hour && rad_order[0].dataValues.hour && inv_order[0].dataValues.hour=== 0) {
         lab_obj["0"] = lab_order["0"] + rad_order["0"] + inv_order["0"];
     }
     if (lab_order[1].dataValues.hour && rad_order[1].dataValues.hour && inv_order[1].dataValues.hour=== 1) {
         lab_obj["1"] = lab_order["1"] + rad_order["1"] + inv_order["1"];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 2) {
         lab_obj["2"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 3) {
         lab_obj["3"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 4) {
         lab_obj["4"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 5) {
         lab_obj["5"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 6) {
         lab_obj["6"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 7) {
         lab_obj["7"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 8) {
         lab_obj["8"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 9) {
         lab_obj["9"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 10) {
         lab_obj["10"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 11) {
         lab_obj["11"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 12) {
         lab_obj["12"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 13) {
         lab_obj["13"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 14) {
         lab_obj["14"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 15) {
         lab_obj["15"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 16) {
         lab_obj["16"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 17) {
         lab_obj["17"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 18) {
         lab_obj["18"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 19) {
         lab_obj["19"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 20) {
         lab_obj["20"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 21) {
         lab_obj["21"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 22) {
         lab_obj["22"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }
     if (lab_order[i].dataValues.hour && rad_order[i].dataValues.hour && inv_order[i].dataValues.hour=== 23) {
         lab_obj["23"] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
     }*/
    //}


    for (let i = 0; i <= 23; i++) {
        obj["" + i + ""] = lab_order["" + i + ""] + rad_order["" + i + ""] + inv_order["" + i + ""];
    }
    return obj;
}

async function getconsgraphbydate(cons_dash, user_uuid, depertment_Id, startDate, stopDate) {
    let cons_graph = {};
    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [[Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['date'],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(startDate).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(stopDate).format('YYYY-MM-DD'))
                ]
            }

        }
    }
    );

    if (diag && diag.length > 0) {

        var dateArray = [];
        var currentDate = moment(startDate);
        var stopDate = moment(stopDate);
        while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
            currentDate = moment(currentDate).add(1, 'days');
        }

        for (let i = 0; i < dateArray.length; i++) {
            cons_graph["" + dateArray[i] + ""] = 0;
        }


        for (let i = 0; i < dateArray.length; i++) {
            for (let j = 0; j < diag.length; j++) {
                if (dateArray[i] === diag[j].dataValues.date) {
                    cons_graph["" + dateArray[i] + ""] = cons_graph["" + dateArray[i] + ""] + diag[j].dataValues.Tot_Count;
                }
            }
        }
        // for (let i = 0; i < diag.length; i++) {
        //     cons_graph["" + diag[i].dataValues.date + ""] = diag[i].dataValues.Tot_Count;
        // }

        return cons_graph;


    } else {
        return {};
    }
}

function getordergraphbydate(lab, rad, inv, startDate, stopDate) {
    let orders_graph = {};

    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
        currentDate = moment(currentDate).add(1, 'days');
    }

    //return dateArray;


    for (let i = 0; i < dateArray.length; i++) {
        orders_graph["" + dateArray[i] + ""] = 0;
    }


    //return orders_graph;
    if (dateArray.length > 0) {

        for (let i = 0; i < dateArray.length; i++) {
            for (let j = 0; j < lab.length; j++) {
                if (dateArray[i] === lab[j].dataValues.date) {
                    orders_graph["" + dateArray[i] + ""] = orders_graph["" + dateArray[i] + ""] + lab[j].dataValues.Count;
                }
            }
            for (let k = 0; k < rad.length; k++) {
                if (dateArray[i] === rad[k].dataValues.date) {
                    orders_graph["" + dateArray[i] + ""] = orders_graph["" + dateArray[i] + ""] + rad[k].dataValues.Count;
                }
            }

            for (let l = 0; l < inv.length; l++) {
                if (dateArray[i] === inv[l].dataValues.date) {
                    orders_graph["" + dateArray[i] + ""] = orders_graph["" + dateArray[i] + ""] + inv[l].dataValues.Count;
                }
            }
        }
    }
    if (orders_graph) {
        return orders_graph;
    }

}

async function getconstodayAll(cons_dash, user_uuid, depertment_Id, from_date, to_date, session, gender) {

    const diag = await cons_dash.findAll({
        //hour( activity_dt ) , day( activity_dt )
        //group: ['ed_consultation_start_date'],
        attributes: [
            //[Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            [Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['hour'],
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
        return [];
    }
}
async function getDiagnosisbytodayAll(diag_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
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
            g_uuid: gender,
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
        return [];
    }
}

async function getchiefcbytodayAll(chiefc_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {
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
            g_uuid: gender,
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
        return [];
    }
}

async function getconsgraphbydateAll(cons_dash, user_uuid, depertment_Id, startDate, stopDate, session, gender) {
    let cons_graph = {};
    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [[Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['date'],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            g_uuid: gender,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(startDate).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(stopDate).format('YYYY-MM-DD'))
                ]
            }

        }
    }
    );

    if (diag && diag.length > 0) {

        var dateArray = [];
        var currentDate = moment(startDate);
        var stopDate = moment(stopDate);
        while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
            currentDate = moment(currentDate).add(1, 'days');
        }

        for (let i = 0; i < dateArray.length; i++) {
            cons_graph["" + dateArray[i] + ""] = 0;
        }


        for (let i = 0; i < dateArray.length; i++) {
            for (let j = 0; j < diag.length; j++) {
                if (dateArray[i] === diag[j].dataValues.date) {
                    cons_graph["" + dateArray[i] + ""] = cons_graph["" + dateArray[i] + ""] + diag[j].dataValues.Tot_Count;
                }
            }
        }
        // for (let i = 0; i < diag.length; i++) {
        //     cons_graph["" + diag[i].dataValues.date + ""] = diag[i].dataValues.Tot_Count;
        // }

        return cons_graph;


    } else {
        return {};
    }
}

async function getconsgraphbysessiondateAll(cons_dash, user_uuid, depertment_Id, startDate, stopDate, session, gender) {
    let cons_graph = {};
    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [[Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['date'],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            s_uuid: session,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(startDate).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(stopDate).format('YYYY-MM-DD'))
                ]
            }

        }
    }
    );

    if (diag && diag.length > 0) {

        var dateArray = [];
        var currentDate = moment(startDate);
        var stopDate = moment(stopDate);
        while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
            currentDate = moment(currentDate).add(1, 'days');
        }

        for (let i = 0; i < dateArray.length; i++) {
            cons_graph["" + dateArray[i] + ""] = 0;
        }


        for (let i = 0; i < dateArray.length; i++) {
            for (let j = 0; j < diag.length; j++) {
                if (dateArray[i] === diag[j].dataValues.date) {
                    cons_graph["" + dateArray[i] + ""] = cons_graph["" + dateArray[i] + ""] + diag[j].dataValues.Tot_Count;
                }
            }
        }
        // for (let i = 0; i < diag.length; i++) {
        //     cons_graph["" + diag[i].dataValues.date + ""] = diag[i].dataValues.Tot_Count;
        // }

        return cons_graph;


    } else {
        return {};
    }
}

async function getconsbysessiondatetoday(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            //[Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
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

async function getconssessiondatetoday(cons_dash, user_uuid, depertment_Id, session, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            [Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
            [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
            [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['hour'],
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

async function getconsgraphbygenderdateAll(cons_dash, user_uuid, depertment_Id, startDate, stopDate, session, gender) {
    let cons_graph = {};
    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [[Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 1 THEN `ed_patient_uuid` END')), 'M_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 2 THEN `ed_patient_uuid` END')), 'F_Count'],
        [Sequelize.fn('COUNT', Sequelize.literal('CASE WHEN `g_uuid` = 3 THEN `ed_patient_uuid` END')), 'T_Count'],
        [Sequelize.fn('COUNT', '*'), 'Tot_Count']
        ],
        group: ['date'],
        where: {
            ed_doctor_uuid: user_uuid,
            ed_status: 1,
            ed_is_active: 1,
            ed_department_uuid: depertment_Id,
            g_uuid: gender,
            ed_consultation_start_date: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '>=', moment(startDate).format('YYYY-MM-DD')),
                    Sequelize.where(Sequelize.fn('date', Sequelize.col('ed_consultation_start_date')), '<=', moment(stopDate).format('YYYY-MM-DD'))
                ]
            }

        }
    }
    );

    if (diag && diag.length > 0) {

        var dateArray = [];
        var currentDate = moment(startDate);
        var stopDate = moment(stopDate);
        while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
            currentDate = moment(currentDate).add(1, 'days');
        }

        for (let i = 0; i < dateArray.length; i++) {
            cons_graph["" + dateArray[i] + ""] = 0;
        }


        for (let i = 0; i < dateArray.length; i++) {
            for (let j = 0; j < diag.length; j++) {
                if (dateArray[i] === diag[j].dataValues.date) {
                    cons_graph["" + dateArray[i] + ""] = cons_graph["" + dateArray[i] + ""] + diag[j].dataValues.Tot_Count;
                }
            }
        }
        // for (let i = 0; i < diag.length; i++) {
        //     cons_graph["" + diag[i].dataValues.date + ""] = diag[i].dataValues.Tot_Count;
        // }

        return cons_graph;


    } else {
        return {};
    }
}

async function getconsbygenderdatetoday(cons_dash, user_uuid, depertment_Id, session, gender, from_date, to_date) {

    const diag = await cons_dash.findAll({
        //group: ['g_uuid',],
        attributes: [
            //[Sequelize.fn('hour', Sequelize.col('ed_consultation_start_date')), 'hour'],
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
        return [];
    }
}


