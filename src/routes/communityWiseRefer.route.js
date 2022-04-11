const express =  require('express');
const community_router = express.Router();
const community_ctrl = require('../controllers/communityWisepatientReferReport.controller')
community_router.route('/OUT').post(community_ctrl.communityWiseReferout);
community_router.route('/IN').post(community_ctrl.communityWiseReferin);
module.exports = community_router;