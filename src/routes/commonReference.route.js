const express = require("express");
const commonreferencectrl = require("../controllers/common_reference_group.controller");


const commonRouter = express.Router();
commonRouter.route("/addReference").post(commonreferencectrl.addReference);
commonRouter.route("/updateReference").post(commonreferencectrl.updateReference);
commonRouter.route("/deleteReference").post(commonreferencectrl.deleteReference);
commonRouter.route("/getReference").post(commonreferencectrl.getReference);
commonRouter.route("/getReferenceById").post(commonreferencectrl.getReferenceById);
commonRouter.route("/getReferenceByIdForLanguage").post(commonreferencectrl.getReferenceByIdForLanguage);


module.exports = commonRouter;