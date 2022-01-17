const httpStatus = require('http-status');
//const mysql_pool = require('../mysql_db/mySqlpool');


const depDiagnosis_Controller = () => {


    const view_depDiagnosis = async (req, res) => {
        try {
            let facility_uuid = req.headers.facility_uuid;  
            
     const selectCountQuery = `
       select pd.department_uuid,d.name as diagnosis,
       count(distinct patient_uuid) as patient_count
       
       from patient_diagnosis pd
       join diagnosis d on pd.diagnosis_uuid =d.uuid
       where pd.facility_uuid=?
       group by pd.department_uuid,d.name 
       
       order by pd.department_uuid,d.name
       
       `
      mysql_pool.mySql_connection.query(selectCountQuery,[facility_uuid],(err, results, fields) => {
                try {
        // console.log("gjselectCountQuery"+results);
    
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
                                    responseContent: {
                                        insertaffectedRows: results
                                    }
                                });
                        }
                        else {

                            res
                            .status(200)
                            .send({
                                code: httpStatus.OK,
                                message: 'Data fetched successfully!',
                                responseContent: {
                                    insertaffectedRows: results
                                }
                            })
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
    };


    const view_docDiagnosis = async (req, res) => {
        try {
            let facility_uuid = req.headers.facility_uuid;  
            
     const selectCountQuery = `
     
select doctor_uuid,d.name as diagnosis,
count(distinct pd.patient_uuid) as patient_count

from patient_diagnosis pd
join diagnosis d on pd.diagnosis_uuid =d.uuid
join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
where pd.facility_uuid=?
group by pd.encounter_doctor_uuid,d.name 

order by doctor_uuid,d.name

     
       
       `
      mysql_pool.mySql_connection.query(selectCountQuery,[facility_uuid],(err, results, fields) => {
                try {
        // console.log("gjselectCountQuery"+results);
    
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
                                    responseContent: {
                                        insertaffectedRows: results
                                    }
                                });
                        }
                        else {

                            res
                            .status(200)
                            .send({
                                code: httpStatus.OK,
                                message: 'Data fetched successfully!',
                                responseContent: {
                                    insertaffectedRows: results
                                }
                            })
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
        
        view_depDiagnosis,
        view_docDiagnosis
    
    }
}
     


module.exports = depDiagnosis_Controller();




