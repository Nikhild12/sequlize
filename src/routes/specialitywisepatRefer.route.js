const express =  require('express');

const speciality_router = express.Router();
const speciality_ctrl = require('../controllers/specialityWisepatRefReport.controller')

speciality_router.route('/OUT').post(speciality_ctrl.specilalityReferout);
speciality_router.route('/IN').post(speciality_ctrl.specilalityReferin);




module.exports = speciality_router;