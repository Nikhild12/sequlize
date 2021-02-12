const httpStatus = require("http-status");

const db = require("../config/sequelize");

const _ = require('lodash');
const multer = require('multer');
const moment = require('moment');
const path = require('path');
const fs = require('file-system');
const mime = require('mime');
const middleware = require('../middleware/middleware');

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


    const _deleteAttachmentDetails = async (req, res) => {

        // plucking data req body
        const { attachment_uuid } = req.query;
        const userUUID = parseInt(req.headers.user_uuid);

        try {
            if (attachment_uuid && userUUID) {
                const updatedAttachData = { status: 0, is_active: 0, modified_by: userUUID, modified_date: new Date() };

                const updateAttachAsync = await attachmentTbl.update(updatedAttachData,
                    { where: { uuid: attachment_uuid } });

                if (updateAttachAsync) {
                    return res.status(200).send({ code: httpStatus.OK, message: "Deleted Successfully" });
                }

            } else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (ex) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: ex.message });
        }
    };

    const _getattachmenttype = async (req, res) => {
        let { user_uuid } = req.headers;

        try {
            if (user_uuid) {
                const data = await attachmentTypeTbl.findAll({ returning: true });

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

    const _getlistBytype = async (req, res) => {
        const { user_uuid } = req.headers;
        const { attachment_type_uuid } = req.query;

        try {
            if (user_uuid && attachment_type_uuid) {
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
                        .json({ statusCode: 200, req: '', responseContents: { attachment: data } });
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
        const { user_uuid } = req.headers;
        const { patient_uuid, attachment_type_uuid } = req.query;
        try {
            if (user_uuid) {
                let findQuery = {
                    where: { patient_uuid: patient_uuid, is_active: 1, status: 1 },
                    include: [
                        {
                            model: attachmentTypeTbl,
                            as: 'attachment_type',
                            attributes: ['uuid', 'code', 'name'],
                            where: { is_active: 1, status: 1 },
                            required: false
                        },
                        {
                            model: encounterTbl,
                            as: 'encounter',
                            attributes: ['uuid', 'patient_uuid', 'encounter_date'],
                            where: { is_active: 1, status: 1 },
                            required: false
                        }]
                }
                if (attachment_type_uuid) {
                    findQuery.where = Object.assign(findQuery.where, {
                        attachment_type_uuid: attachment_type_uuid
                    });
                }
                const data = await attachmentTbl.findAll(findQuery);
                if (data) {
                    return res
                        .status(httpStatus.OK)
                        .json({ statusCode: 200, req: '', responseContents: { attachment: data } });
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

    const _download = async (req, res) => {
        const { user_uuid } = req.headers;
        const { file_path } = req.query;
        const location = './' + file_path;
        try {
            if (file_path && user_uuid) {
                if (fs.existsSync(location)) {

                    var filename = path.basename(location);
                    var mimetype = mime.lookup(location);

                    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                    res.setHeader('Content-type', mimetype);

                    var filestream = fs.createReadStream(location);
                    filestream.pipe(res);

                } else { return res.status(400).send({ code: httpStatus[400], message: "no such file or directory" }); }
            } else { return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
        } catch (err) {
            res.send({ "status": 400, "message": err.message });
        }
    };

    const uploadD = multer({ storage: middleware.multerDynamicUpload('') }).any();

    const _upload = async (req, res) => {
        let userUUID = req.headers.user_uuid;
        try {
            if (userUUID) {
                uploadD(req, res, async (err) => {
                    const attachmentData = req.body;

                    if (err instanceof multer.MulterError) {
                        res.send({ status: 400, message: err });
                    } else if (err) {
                        res.send({ status: 400, message: err });
                    } else {
                        attachmentData.consultation_uuid = userUUID;
                        attachmentData.is_active = attachmentData.status = true;
                        attachmentData.attached_date = moment(attachmentData.attached_date).format('YYYY-MM-DD HH:mm:ss');
                        attachmentData.created_by = attachmentData.modified_by = userUUID;
                        attachmentData.created_date = attachmentData.modified_date = new Date();
                        attachmentData.file_path = req.files[0].path;
                        attachmentData.revision = 1;
                        await attachmentTbl.create(attachmentData, { returning: true });
                        res.send({ "status": 200, "attachment data": attachmentData, "files": req.files, "count": req.files.length, "message": "Files Uploaded Successfully " });
                    }
                });
            } else { return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" }); }
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
        download: _download,
        deleteAttachmentDetails: _deleteAttachmentDetails
    };
};

module.exports = patientAttachmentsController();


function getExtension(file, folder_name) {
    let dir_name;
    if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file.originalname)) {
        dir_name = "./src/assets/uploads/" + folder_name + "/images";
    } else if ((/\.(pdf)$/i).test(file.originalname)) {
        dir_name = "./src/assets/uploads/" + folder_name + "/pdf";
    } else if ((/\.(xlsx)$/i).test(file.originalname)) {
        dir_name = "./src/assets/uploads/" + folder_name + "/xlsx";
    } else if ((/\.(json)$/i).test(file.originalname)) {
        dir_name = "./src/assets/uploads/" + folder_name + "/json";
    } else if ((/\.(doc|docx)$/i).test(file.originalname)) {
        dir_name = "./src/assets/uploads/" + folder_name + "/docx";
    }
    return dir_name;
}

