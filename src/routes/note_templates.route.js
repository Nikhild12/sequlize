

const express = require("express");
const notetemplateCtrl = require("../controllers/note_templates.controller");

const notetemplateRoutes = express.Router(); // eslint-disable-line new-cap





notetemplateRoutes.route("/createNoteTemplate").post(notetemplateCtrl.postnoteTemplates);
notetemplateRoutes.route("/getNoteTemplate").post(notetemplateCtrl.getnoteTemplates);
notetemplateRoutes.route("/deleteNoteTemplate").post(notetemplateCtrl.deletenoteTemplatesr);
notetemplateRoutes.route("/updateNoteTemplate").post(notetemplateCtrl.updatenoteTemplatesById);
notetemplateRoutes.route("/getNoteTemplateById").post(notetemplateCtrl.getnoteTemplatesrById);
notetemplateRoutes.route("/getnotetemplatebytype").post(notetemplateCtrl.getNoteTemplateByType);

module.exports = notetemplateRoutes;