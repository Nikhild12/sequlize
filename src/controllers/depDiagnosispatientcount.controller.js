const httpStatus = require('http-status');
const mysql_pool = require('../mysql_db/mySqlpool');
const config = require('../config/config');

const rp = require("request-promise");


const requestApi = require('../requests/requests');
const clinical_notesController = require('./clinical_notes.controller');

const depDiagnosis_Controller = () => {


    const view_depDiagnosis = async (req, res) => {
        try {
            let facility_uuid = req.headers.facility_uuid;
            let dep_filter = req.headers.department_uuid;

            const selectCountQuery = ` select pd.department_uuid,d.name as diagnosis, count(distinct patient_uuid) as patient_count from patient_diagnosis pd join diagnosis d on pd.diagnosis_uuid =d.uuid where pd.facility_uuid=? and pd.department_uuid =? group by pd.department_uuid,d.name order by pd.department_uuid,d.name `;

            mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,dep_filter], async (err, results, fields) => {
                try {
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
                            const data = results && results.length > 0 ? results.reduce((acc, cur) => {
                                const  index = department_details.responseContent.rows.findIndex(a=>a.uuid === cur.department_uuid);
                                if(index > -1){
                                    cur['department_name'] = department_details.responseContent.rows[index].name;
                                }
                                acc.push(cur);
                                return acc;
                            }, []) : [];
        
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


    const view_docDiagnosis = async (req, res) => {
        try {
            let facility_uuid = req.headers.facility_uuid;
            let dep_filter = req.headers.department_uuid;

           let doc_uuid = req.headers.user_uuid;

            const selectCountQuery = `
     
select doctor_uuid,d.name as diagnosis,
count(distinct pd.patient_uuid) as patient_count

from patient_diagnosis pd
join diagnosis d on pd.diagnosis_uuid =d.uuid
join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
where pd.facility_uuid=?  and doctor_uuid=? and pd.department_uuid=?
group by pd.encounter_doctor_uuid,d.name 

order by doctor_uuid,d.name
       `
       mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,dep_filter], async (err, results, fields) => {
        try {
            const docIds = results && results.length > 0 ? results.reduce((acc, cur) => {
                acc.push(cur.doctor_uuid);
                return acc;
            }, []) : [];
            let options = {
                uri: config.wso2AppUrl + 'userProfile/getSpecificUsersByIds',
                headers: {
                    Authorization: req.headers.authorization,
                    user_uuid: req.headers.user_uuid,
                    facility_uuid: req.headers.facility_uuid
                },
                body: {
                    "uuid": docIds
                },
                method: "POST",

                json: true
            };
            //console.log("____________________________", options.uri);  
            const doctor_details = await rp(options);

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
                    const data = results && results.length > 0 ? results.reduce((acc, cur) => {
                        const  index = doctor_details.responseContents.findIndex(a=>a.uuid === cur.doctor_uuid);
                        if(index > -1){
                            cur['doctor_name'] = doctor_details.responseContents[index].first_name;
                        }
                        acc.push(cur);
                        return acc;
                    }, []) : [];

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

        view_depDiagnosis,
        view_docDiagnosis

    }
}

module.exports = depDiagnosis_Controller();