// Package Import
const httpStatus = require("http-status");

// Sequelizer Import
const sequelizeDb = require('../config/sequelize');

// Initialize Encounter
const vital_tbl = sequelizeDb.patient_vitals;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const getPatientVitals_Controller = () => {
    
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */

    const view_patVitals = async (req, res) => {
        const { user_uuid } = req.headers;
        const searchData = req.body;
        try {
            if (user_uuid) {
                const notesData = await vital_tbl.findAll(
                    {
                        attributes: { exclude: [ "createdAt", "updatedAt"] },
                        order: [['uuid', 'DESC']],
                        where:{
                            
                            vital_master_uuid: { [Op.in]: searchData.vital_uuid },
                            patient_uuid: { [Op.in]: searchData.patient_uuid },
                        }
                    },
                );
                return res.status(200).send({ statusCode: httpStatus.OK, message:"OK", responseContents: notesData });
            }
            else {
                return res.status(422).send({ code: httpStatus[400], message: "Failed" });
            }
        } catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };





    return {

        view_patVitals


    }



}




module.exports = getPatientVitals_Controller();