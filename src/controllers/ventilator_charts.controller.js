const httpStatus = require("http-status");

const db = require("../config/sequelize");

const moment = require('moment');

const ventilatorTbl = db.ventilator_charts;

const ventilatorchartsController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */


    const _createVentilator = async (req, res) => {
        let {user_uuid} = req.headers;
        let postdata = req.body;
        try {
            if (user_uuid && postdata) {
                        postdata.is_active = postdata.status = true;
                        postdata.ventilator_date = moment(postdata.ventilator_date).format('YYYY-MM-DD HH:mm:ss');
                        console.log(postdata.ventilator_date);
                        postdata.ventilator_time = moment(postdata.ventilator_date).format('YYYY-MM-DD HH:mm:ss');
                        console.log(postdata.ventilator_time);
                        postdata.created_by = postdata.modified_by = user_uuid;
                        postdata.created_date = postdata.modified_date = new Date();
                        postdata.revision = 1;
                        const createdData = await ventilatorTbl.create(postdata, { returning: true });
                        if (createdData){
                          res.send({ "status": 200, "Ventilator data": createdData, "message": "Inserted Successfully " });
                        }
            } else {
                    return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); 
                }
        }catch (ex) {
            res.send({ "status": 400, "message": ex.message });
        }
    };

const _getventilatorbypatientid = async (req, res) => {
    let { user_uuid } = req.headers;
    let {patient_uuid} = req.query;

    try {
        if (user_uuid && patient_uuid) {
            const data = await ventilatorTbl.findAll({
                where:{
                    patient_uuid: patient_uuid,
                    is_active: 1,
                    status: 1
                }
            },{ returning: true });

            if (data) {
                return res
                    .status(httpStatus.OK)
                    .json({ statusCode: 200, req: '', responseContents: data });
            }
        }
        else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    } catch (err) {
        const errorMsg = err.errors ? err.errors[0].message : err.message;
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ status: "error", msg: errorMsg });
    }
};

const _updateventilatorbypatientid = async (req, res) => {
    let { user_uuid } = req.headers;
    let {patient_uuid} = req.query;
    let postdata = req.body;
    let selector = { 
        where: { patient_uuid: patient_uuid }
      };
      
    try {
        if (user_uuid && patient_uuid) {
            const data = await ventilatorTbl.update(postdata,selector, {returning: true});

            if (data) {
                res.send({ "status": 200, "message": "updated Successfully " });
            }
        }
        else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    } catch (err) {
        const errorMsg = err.errors ? err.errors[0].message : err.message;
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ status: "error", msg: errorMsg });
    }
};

const _deleteVentilatorDetails = async (req, res) => {

    // plucking data req body
    const { ventilator_uuid } = req.query;
    const {user_uuid} = req.headers;

    try {
        if (ventilator_uuid && user_uuid) {
            const updatedVenlitorData = { status: 0, is_active: 0, modified_by: user_uuid, modified_date: new Date() };

            const updatedVenlator = await ventilatorTbl.update(updatedVenlitorData,
                { where: { uuid: ventilator_uuid } });

            if (updatedVenlator) {
                return res.status(200).send({ code: httpStatus.OK, message: "Deleted Successfully" });
            }

        } else {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    } catch (ex) {
        return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
    }
};



return {
    createVentilator: _createVentilator,
    getventilatorbypatientid: _getventilatorbypatientid,
    updateventilatorbypatientid: _updateventilatorbypatientid,
    deleteVentilatorDetails: _deleteVentilatorDetails 
};
};

module.exports = ventilatorchartsController();