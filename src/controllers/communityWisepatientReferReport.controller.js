const httpStatus = require('http-status');

const db = require("../config/sequelize");
const Sequelize = require("sequelize");
const communityywiseRefer_Controller = () => {

  


    const communityWiseReferout = async (req, res) => {
        try {
            const { facility_uuid } = req.headers;
            const { fromdate, todate } = req.body;

            const date_query = fromdate && todate ? ` date (pr.referred_date) BETWEEN  '${fromdate}' AND '${todate}' ` : ' ';
            const facility_id_query = facility_uuid ? ` and pr.facility_uuid = ${facility_uuid} ` : ' ';
           

            const selectCountQuery = `select CASE WHEN community_name IN ('SC','ST','Scheduled Caste','Scheduled Tribe') THEN community_name ELSE 'OTHERS' END AS community_name,sum(CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_male',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_female',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_transgender',
            sum(CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) 'new_adult_total',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_male',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_female',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_transgender',
            sum(CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_total',
            
            sum(CASE WHEN  gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_male',
            sum(CASE WHEN  gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_female',
            sum(CASE WHEN  gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_transgender',
            sum(CASE WHEN ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'total_new_patients',
            
            
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_male',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_female',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_transgender',
            sum(CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as'old_adult_total',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_male',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_female',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_transgender',
            sum(CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_total',
            
            
            
            sum(CASE WHEN  gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_male',
            sum(CASE WHEN  gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_female',
            sum(CASE WHEN  gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_transgender',
            
            sum(CASE WHEN ed.visit_type_uuid = 2 THEN 1 ELSE 0 END ) as 'total_old_patients',
            sum(CASE WHEN ed.visit_type_uuid in (1,2) THEN 1 ELSE 0 END ) as 'total_patients'
            
            
            
            from encounter e join patient_referral pr on pr.encounter_uuid=e.uuid join encounter_doctors ed on ed.encounter_uuid=e.uuid where `+ date_query + facility_id_query+
                ` and referral_type_uuid=2
                
                group by CASE WHEN community_name IN ('SC','ST','Scheduled Caste','Scheduled Tribe') THEN community_name ELSE 'OTHERS' END 
                order by CASE WHEN community_name IN ('SC','ST','Scheduled Caste','Scheduled Tribe') THEN community_name ELSE 'OTHERS' END asc `;

            console.log(selectCountQuery);

            db.sequelize.query(selectCountQuery, {
                type: Sequelize.QueryTypes.SELECT
            }).then(async results => {
                return res
                    .status(httpStatus.OK)
                    .json({
                        code: 200,
                        message: "Data fetched successfully!",
                        responseContent: (results && results.length > 0) ? results : []
                    });
            }).catch((err) => {
                let message = err.message;
                if (message && message.includes('Cannot read property')) {
                    return res.json({
                        code: 200,
                        responseContent: [],
                    });
                }
                else {
                    return res.json({
                        code: 500,
                        message: err.message,
                    });
                }
            });

        } catch (error) {
            res
                .status(400)
                .send({ message: error.message, error: error });
        }

    }
 
    const communityWiseReferin = async (req, res) => {
        try {
            const { facility_uuid } = req.headers;
            const { fromdate, todate } = req.body;

            const date_query = fromdate && todate ? ` date (pr.referred_date) BETWEEN  '${fromdate}' AND '${todate}' ` : ' ';
            const facility_id_query = facility_uuid ? ` and pr.facility_uuid = ${facility_uuid} ` : ' ';
           

            const selectCountQuery = ` select CASE WHEN community_name IN ('SC','ST','Scheduled Caste','Scheduled Tribe') THEN community_name ELSE 'OTHERS' END AS community_name,sum(CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_male',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_female',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_adult_transgender',
            sum(CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) 'new_adult_total',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_male',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_female',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_transgender',
            sum(CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_child_total',
            
            sum(CASE WHEN  gender_uuid = 1 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_male',
            sum(CASE WHEN  gender_uuid = 2 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_female',
            sum(CASE WHEN  gender_uuid = 3 AND ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'new_transgender',
            sum(CASE WHEN ed.visit_type_uuid = 1 THEN 1 ELSE 0 END) as 'total_new_patients',
            
            
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_male',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_female',
            sum(CASE WHEN is_adult = 1 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END)as 'old_adult_transgender',
            sum(CASE WHEN is_adult = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as'old_adult_total',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_male',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_female',
            sum(CASE WHEN is_adult = 0 AND gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_transgender',
            sum(CASE WHEN is_adult = 0 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_child_total',
            
            
            
            sum(CASE WHEN  gender_uuid = 1 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_male',
            sum(CASE WHEN  gender_uuid = 2 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_female',
            sum(CASE WHEN  gender_uuid = 3 AND ed.visit_type_uuid = 2 THEN 1 ELSE 0 END) as 'old_transgender',
            
            sum(CASE WHEN ed.visit_type_uuid = 2 THEN 1 ELSE 0 END ) as 'total_old_patients',
            sum(CASE WHEN ed.visit_type_uuid in (1,2) THEN 1 ELSE 0 END ) as 'total_patients'
            
            
            
            from encounter e join patient_referral pr on pr.encounter_uuid=e.uuid join encounter_doctors ed on ed.encounter_uuid=e.uuid where `+ date_query + facility_id_query+
                ` and referral_type_uuid=1
                
                group by CASE WHEN community_name IN ('SC','ST','Scheduled Caste','Scheduled Tribe') THEN community_name ELSE 'OTHERS' END 
                order by CASE WHEN community_name IN ('SC','ST','Scheduled Caste','Scheduled Tribe') THEN community_name ELSE 'OTHERS' END asc `;

            console.log(selectCountQuery);

            db.sequelize.query(selectCountQuery, {
                type: Sequelize.QueryTypes.SELECT
            }).then(async results => {
                return res
                    .status(httpStatus.OK)
                    .json({
                        code: 200,
                        message: "Data fetched successfully!",
                        responseContent: (results && results.length > 0) ? results : []
                    });
            }).catch((err) => {
                let message = err.message;
                if (message && message.includes('Cannot read property')) {
                    return res.json({
                        code: 200,
                        responseContent: [],
                    });
                }
                else {
                    return res.json({
                        code: 500,
                        message: err.message,
                    });
                }
            });

        } catch (error) {
            res
                .status(400)
                .send({ message: error.message, error: error });
        }

    }

    return {

        communityWiseReferout,
        communityWiseReferin
        


    }
}

module.exports = communityywiseRefer_Controller();