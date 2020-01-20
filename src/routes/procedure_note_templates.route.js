// package Imports
const express = require('express');

// EMR Workflow Controller Import
const procedureNoteTemplatesCtrl = require('../controllers/procedure_note_templates.controller');

// Express Router Initialize
const  procedureNoteTemplatesRoutes = express.Router();

procedureNoteTemplatesRoutes.route('/getprocedures-note-template').post(procedureNoteTemplatesCtrl.getprocedureNoteTemplates);
procedureNoteTemplatesRoutes.route('/createprocdures-note-template').post(procedureNoteTemplatesCtrl.postprocedureNoteTemplates);
procedureNoteTemplatesRoutes.route('/deleteProcedures-note-template').post(procedureNoteTemplatesCtrl.deleteprocedureNoteTemplates);
procedureNoteTemplatesRoutes.route('/updateProcedures-note-template').post(procedureNoteTemplatesCtrl.updateprocedureNoteTemplates);
procedureNoteTemplatesRoutes.route('/getProcedures-note-templateById').post(procedureNoteTemplatesCtrl.getprocedureNoteTemplatesById);

module.exports = procedureNoteTemplatesRoutes;