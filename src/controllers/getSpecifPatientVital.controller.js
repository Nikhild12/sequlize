const httpStatus = require('http-status');
const mysql_pool = require('../mysql_db/mySqlpool');



const getPatientVitals_Controller = () => {


    const view_patVitals = async (req, res) => {

let user_uuid= req.headers.user_uuid;
let vital_uuid= req.body.vital_uuid;

let patient_uuid =req.body.patient_uuid;



        try {

          const selectCountQuery = `
            
            select * from patient_vitals pv
join vital_masters vm on vm.uuid =pv.vital_master_uuid 

where patient_uuid =?  and vm.uuid=?     


            `
          mysql_pool.mySql_connection.query(selectCountQuery, [patient_uuid,vital_uuid], async (err, results, fields) => {
                try {
                  
        
                    if (err) {
                        res
                            .status(400)
                            .send({
                                code: httpStatus.BAD_REQUEST,
                                message: 'Failed to get data!',
                                error: err
                            });
                    }
                    else {
                        if (!results[0]) {
                            res
                                .status(200)
                                .send({
                                    code: httpStatus.OK,
                                    message: 'No respective  data were found!',
                                    responseContent: []
                                });
                        }
                        else {
                   
                            res
                                .status(200)
                                .send({
                                    code: httpStatus.OK,
                                    message: 'Data fetched successfully!',
                                    responseContent: data
                                });
                        }
                    }
                } catch (error) {
                    res
                        .status(400)
                        .send({ message: error.message, error: error })
                }
            });
        } catch (error) {
            res
                .status(400)
                .send({ message: error.message, error: error });
        }


    }




    return {

        view_patVitals
    

    }





















}

module.exports = getPatientVitals_Controller();