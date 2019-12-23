const httpStatus = require("http-status");

const db = require("../config/sequelize");

const _ = require('lodash');
const multer = require('multer');
//const path = require('path');
const fs = require('file-system');
//const bodyParser = require('body-parser');

const attachmentTbl = db.patient_attachments;
const attachmentTypeTbl = db.attachment_type;
const encounterTbl = db.encounter;


const patientAttachmentsController = () => {
    /**
    * Returns jwt token if valid username and password is provided
    * @param req
    * @param res
    * @param next
    @returns {}
    */
   
   
const _getattachmenttype = async (req, res) => {
    let {user_uuid} = req.headers;

    try {
        if (user_uuid){
        const data = await attachmentTypeTbl.findAll({returning:true });
                                   
            if (data) {
                return res
                    .status(httpStatus.OK)
                    .json({statusCode: 200, req: '', responseContents: data });
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

const _getlistBytype = async (req, res) => {
    const {user_uuid} = req.headers;
    const {attachment_type_uuid} = req.query;

    try {
        if (user_uuid && attachment_type_uuid){
        const data = await attachmentTbl.findAll({
            where: { 
                attachment_type_uuid: attachment_type_uuid
            },
            include: [
                {
                  model: attachmentTypeTbl,
                  as: 'attachment_type',
                  attributes: ['uuid', 'code', 'name'],
                  where: { is_active: 1, status: 1 }
                },
               {
                    model: encounterTbl,
                    as: 'encounter',
                    attributes: ['uuid', 'patient_uuid', 'encounter_date'],
                    where: { is_active: 1, status: 1 }
                },]
        },
            { returning: true } 
        );
                            
            if (data) {
                return res
                    .status(httpStatus.OK)
                    .json({statusCode: 200, req: '', responseContents: {attachment: data} });
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

const _getAllAttachments = async (req, res) => {
    const {user_uuid} = req.headers;
    //const {attachment_type_uuid} = req.query;

    try {
        if (user_uuid){
        const data = await attachmentTbl.findAll({
            include: [
                {
                  model: attachmentTypeTbl,
                  as: 'attachment_type',
                  attributes: ['uuid', 'code', 'name'],
                  where: { is_active: 1, status: 1 }
                },
               {
                    model: encounterTbl,
                    as: 'encounter',
                    attributes: ['uuid', 'patient_uuid', 'encounter_date'],
                    where: { is_active: 1, status: 1 }
                  },]
        },
            { returning: true } 
        );
                                   
            if (data) {
                return res
                    .status(httpStatus.OK)
                    .json({statusCode: 200, req: '', responseContents: {attachment: data} });
            }
        } 
        else 
        {
            return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
        }
    } catch (err) {
        const errorMsg = err.errors ? err.errors[0].message : err.message;
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ status: "error", msg: errorMsg });
    }
};

const _download = async(req, res) => {
    const {user_uuid} = req.headers;
    const {file_path} = req.query;
    const location = './'+file_path;
    try{
        if (file_path && user_uuid){
           await res.download(location, function (err, success)
            {
                if (err){
                   console.log("download failed");
                }
                   else{ 
                    console.log("download sucess");
                   }
            }
            );
    } else {return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });}
    } catch (err){
        res.send({ "status": 400, "message": ex.message });
    }
};



const storage = multer.diskStorage({
    destination: async function (req, file, callback) {
       let {folder_name} = req.body; 
       let getDir_Name = getExtension(file, folder_name);
       
       if(!fs.existsSync(getDir_Name)){
            fs.mkdirSync(getDir_Name,(err)=>{
                if(err) throw err;   
            });
        }
        callback(null, getDir_Name);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const uploadD =  multer({ storage: storage }).any();

const _upload = async(req, res) => {
    let userUUID = req.headers.user_uuid;
    try {
        if (userUUID){
         uploadD(req,res ,async (err)=>{
            const attachmentData = req.body;
            //console.log ("---------",attachmentData);

            if(err instanceof multer.MulterError){
                res.send({status:400,message:err}); 
            }else if(err){
                res.send({status:400,message:err}); 
            }else{
                attachmentData.consultation_uuid = userUUID;
                //attachmentData.attachment_name = req.file.originalname;
                attachmentData.is_active = attachmentData.status = true;
                attachmentData.created_by = attachmentData.modified_by = userUUID;
                attachmentData.created_date = attachmentData.modified_date = new Date();
                attachmentData.file_path = req.files[0].path;
                console.log("--------",req.files[0].path);
                await attachmentTbl.create(attachmentData, { returning: true });
                res.send({"status": 200,"attachment data":attachmentData,"files":req.files,"count":req.files.length,"message":"Files Uploaded Successfully "});
             }
        });
        } else {return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
    }
    catch (ex) {
        res.send({ "status": 400, "message": ex.message });
    }
};

return {
    upload: _upload,
    getattachmenttype: _getattachmenttype,
    getlistBytype: _getlistBytype,
    getAllAttachments: _getAllAttachments,
    download: _download
    };
};

module.exports = patientAttachmentsController();


function getExtension(file,folder_name) {
    let dir_name;
    if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/images";
    } else if((/\.(pdf)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/pdf";            
    } else if((/\.(xlsx)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/xlsx";            
    } else if((/\.(json)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/json";            
    } else if((/\.(doc|docx)$/i).test(file.originalname)){
        dir_name = "./src/assets/uploads/"+folder_name+"/docx";            
    }
    return dir_name;
}

