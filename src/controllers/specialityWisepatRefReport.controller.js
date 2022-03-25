const httpStatus = require('http-status');
const config = require('../config/config');

const rp = require("request-promise");

const db = require("../config/sequelize");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const specialitywiseRefer_Controller = () => {

    const specilalityReferout = async (req, res) => {
        try {
          
             let facility_uuid = req.headers.facility_uuid;
             let fromdate =req.body.fromdate;
             let todate=req.body.todate;
             let department_uuid=req.body.department_uuid;

            sqlquery = "";
            sqlquery += "  select pr.referral_deptartment_uuid as department_uuid,sum(CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_male',sum(CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_female',sum(CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_transgender',sum(CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) 'new_adult_total',sum (CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_male',sum (CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_female',";
            sqlquery += " sum (CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_transgender',sum (CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_total',sum (CASE WHEN ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'total_new_patients',sum (CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_male',sum (CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_female',sum (CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_transgender',";
            sqlquery += "  sum (CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as'old_adult_total',sum (CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_male',sum (CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_female',";
            sqlquery += " sum (CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_transgender',sum (CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_total',sum (CASE WHEN ed.visit_type_uuid = 2 THEN 1 ELSE 0 END ) as 'total_old_patients'";
           
            sqlquery += " from encounter e join patient_referral pr on pr.encounter_uuid=e.uuid join encounter_doctors ed on ed.encounter_uuid=e.uuid";
        
            sqlquery += " where date (pr.referred_date) >='" + fromdate + "' ";
            sqlquery += " and  date (pr.referred_date)  <='" + todate + "' ";
            sqlquery += " and pr.facility_uuid='" + facility_uuid + "' " ;
            sqlquery += " and pr.department_uuid='" + department_uuid + "' " ;
            sqlquery += "group by referral_deptartment_uuid"

            db.sequelize.query(sqlquery, {
                type: Sequelize.QueryTypes.SELECT
            }).then(async results => {


                const depIds = results && results.length > 0 ? results.reduce((acc, cur) => {
                    acc.push(cur.department_uuid);
                    return acc;
                }, []) : [];
                let options = {
                    uri: config.wso2AppUrl + 'department/getSpecificDepartmentsByIds',
                    headers: {
                        Authorization: req.headers.authorization,
                        user_uuid: req.headers.user_uuid,
                        facility_uuid: req.headers.facility_uuid
                    },
                    body: {
                        "uuid": depIds
                    },
                    method: "POST",

                    json: true
                };
                //console.log("____________________________", options.uri);  
                const department_details = await rp(options);

                const data = results && results.length > 0 ? results.reduce((acc, cur) => {
                    const  index = department_details.responseContent.rows.findIndex(a=>a.uuid === cur.department_uuid);
                    if(index > -1){
                        cur['department_name'] = department_details.responseContent.rows[index].name;
                    }
                    acc.push(cur);
                    return acc;
                }, []) : [];
                return res           
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        message: "success",
                        responseContents: (data && data.length > 0) ? data : "No respective data were found!",
                    });
            }).catch((err) => {
                let message = err.message;
                if (message && message.includes('Cannot read property')) {
                    return res.json({
                        statusCode: 200,
                        responseContents: [],
                    });
                }
                else {
                    return res.json({
                        statusCode: 500,
                        message: err.message,
                    });
                }
            });
        }
        catch (err) {
            return res.json({
                statusCode: 500,
                message: err.message,
            });
        }
    }

    const specilalityReferin = async (req, res) => {
        try {
    
             let facility_uuid = req.headers.facility_uuid;
             let fromdate =req.body.fromdate;
             let todate=req.body.todate;
             let department_uuid=req.body.department_uuid;

            sqlquery = "";
            sqlquery += "  select pr.department_uuid as department_uuid,sum(CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_male',sum(CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_female',sum(CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_transgender',sum(CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) 'new_adult_total',sum (CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_male',sum (CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_female',";
            sqlquery += " sum (CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_transgender',sum (CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_total',sum (CASE WHEN ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'total_new_patients',sum (CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_male',sum (CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_female',sum (CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_transgender',";
            sqlquery += "  sum (CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as'old_adult_total',sum (CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_male',sum (CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_female',";
            sqlquery += " sum (CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_transgender',sum (CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_total',sum (CASE WHEN ed.visit_type_uuid = 2 THEN 1 ELSE 0 END ) as 'total_old_patients'";
            sqlquery += " from encounter e join patient_referral pr on pr.encounter_uuid=e.uuid join encounter_doctors ed on ed.encounter_uuid=e.uuid";
            sqlquery += " where date (pr.referred_date) >='" + fromdate + "' ";
            sqlquery += " and  date (pr.referred_date)  <='" + todate + "' ";
            sqlquery += " and pr.referral_facility_uuid='" + facility_uuid + "' " ;
            sqlquery += " and pr.referral_deptartment_uuid='" + department_uuid + "' " ;
            sqlquery += "group by pr.department_uuid"

            db.sequelize.query(sqlquery, {
                type: Sequelize.QueryTypes.SELECT
            }).then(async results => {


                const depIds = results && results.length > 0 ? results.reduce((acc, cur) => {
                    acc.push(cur.department_uuid);
                    return acc;
                }, []) : [];
                let options = {
                    uri: config.wso2AppUrl + 'department/getSpecificDepartmentsByIds',
                    headers: {
                        Authorization: req.headers.authorization,
                        user_uuid: req.headers.user_uuid,
                        facility_uuid: req.headers.facility_uuid
                    },
                    body: {
                        "uuid": depIds
                    },
                    method: "POST",

                    json: true
                };
                //console.log("____________________________", options.uri);  
                const department_details = await rp(options);

                const data = results && results.length > 0 ? results.reduce((acc, cur) => {
                    const  index = department_details.responseContent.rows.findIndex(a=>a.uuid === cur.department_uuid);
                    if(index > -1){
                        cur['department_name'] = department_details.responseContent.rows[index].name;
                    }
                    acc.push(cur);
                    return acc;
                }, []) : [];
               
                return res
              
                    .status(httpStatus.OK)
                    .json({
                        statusCode: 200,
                        message: "success",
                        responseContents: (data && data.length > 0) ? data : "No respective data were found!",
                    });
            }).catch((err) => {
                let message = err.message;
                if (message && message.includes('Cannot read property')) {
                    return res.json({
                        statusCode: 200,
                        responseContents: [],
                    });
                }
                else {
                    return res.json({
                        statusCode: 500,
                        message: err.message,
                    });
                }
            });
        }
        catch (err) {
            return res.json({
                statusCode: 500,
                message: err.message,
            });
        }

    }



    return {

        specilalityReferout,
        specilalityReferin
        

    }
}

module.exports = specialitywiseRefer_Controller();