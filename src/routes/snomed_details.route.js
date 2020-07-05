const express =  require('express');

const sm_router = express.Router();
const smctrl = require('../controllers/snomed_details.controller');

sm_router.route('/getsnomeddetails').get(smctrl.getsnomeddetails);
sm_router.route('/getsnomedparent').get(smctrl.getsnomedparent);
sm_router.route('/getsnomedchildren').get(smctrl.getsnomedchildren);


module.exports = sm_router;