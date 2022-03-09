const httpStatus = require('http-status');
const mysql_pool = require('../mysql_db/mySqlpool');
const config = require('../config/config');

const rp = require("request-promise");


const requestApi = require('../requests/requests');
const clinical_notesController = require('./clinical_notes.controller');

const depDiagnosis_Controller = () => {


    const view_depDiagnosis = async (req, res) => {




if (req.body.department_uuid>0 )

{


        try {
            let facility_uuid = req.headers.facility_uuid;
            let dep_filter = req.body.department_uuid;

            let fromdate =req.body.fromdate;
               let todate=req.body.todate;


            const selectCountQuery = `select pd.department_uuid,d.name as diagnosis,count(distinct pd.patient_uuid) as patient_count
             from patient_diagnosis pd 
             join diagnosis d on pd.diagnosis_uuid =d.uuid 
             where pd.facility_uuid=? 
             and pd.department_uuid =? and date(pd.created_date) >= ? and date(pd.created_date) <=? 
             group by pd.department_uuid,d.name order by date(pd.created_date),pd.department_uuid,d.name`;


            mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,dep_filter,fromdate,todate], async (err, results, fields) => {
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

                    const patuuids = results && results.length > 0 ? results.reduce((acc, cur) => {
                        acc.push(cur.department_uuid);
                        return acc;
                    }, []) : [];




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

    else

    {
        try {
            let facility_uuid = req.headers.facility_uuid;

            let fromdate =req.body.fromdate;
               let todate=req.body.todate;



            const selectCountQuery = `select d.name as diagnosis, count(distinct pd.patient_uuid) as patient_count 
 
from patient_diagnosis pd 
join diagnosis d on pd.diagnosis_uuid =d.uuid 
where pd.facility_uuid=?
AND date(pd.created_date) >= ? and date(pd.created_date) <=? 
GROUP BY d.name `
          mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,fromdate,todate], async (err, results, fields) => {
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


    }


    const view_docDiagnosis = async (req, res) => {

        if (req.body.department_uuid>0 )

{

      try {
            let facility_uuid = req.headers.facility_uuid;
            let dep_filter = req.body.department_uuid;
            let fromdate =req.body.fromdate;
               let todate=req.body.todate;

           let doc_uuid = req.headers.user_uuid;

            const selectCountQuery = `
     
select doctor_uuid,d.name as diagnosis,
count(distinct pd.patient_uuid) as patient_count

from patient_diagnosis pd
join diagnosis d on pd.diagnosis_uuid =d.uuid
join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
where pd.facility_uuid=?  and doctor_uuid=? and pd.department_uuid=? 
and date(ed.created_date) >= ? and date(ed.created_date) <=?

group by doctor_uuid,d.name 

order by date(ed.created_date),doctor_uuid,d.name
       `
       mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,dep_filter,fromdate,todate], async (err, results, fields) => {
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


else 

{

    try {
        let facility_uuid = req.headers.facility_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;

       let doc_uuid = req.headers.user_uuid;

        const selectCountQuery = `
 
select doctor_uuid,d.name as diagnosis,
count(distinct pd.patient_uuid) as patient_count

from patient_diagnosis pd
join diagnosis d on pd.diagnosis_uuid =d.uuid
join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
where pd.facility_uuid=?  and doctor_uuid=?  
and date(ed.created_date) >= ? and date(ed.created_date) <=?

group by doctor_uuid,d.name 

order by date(ed.created_date),doctor_uuid,d.name
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,fromdate,todate], async (err, results, fields) => {
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

}








const view_docDiagnosisGengerwise = async (req, res) => {

    if (req.body.department_uuid>0 )


{

  try {
        let facility_uuid = req.headers.facility_uuid;
        let dep_filter = req.body.department_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;
           let visit_type=req.body.visit_type;



        const selectCountQuery = `
 
select
        d.name as diagnosis,

        SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Male_Count",
        SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Female_Count",
        SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=1) THEN 1 ELSE 0 END) AS 'Adult_TG_Count',
        SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Male_Count",
        SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Female_Count",
        SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_TG_Count",

        SUM(CASE WHEN (e.gender_uuid in(1,2,3)) THEN 1 ELSE 0 END) AS "Total_Count"
        
        from 
        patient_diagnosis pd
        join encounter e on e.uuid=pd.encounter_uuid
        join diagnosis d on pd.diagnosis_uuid =d.uuid
        join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
         where pd.facility_uuid=?   and pd.department_uuid=? 
        and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
        group by d.name 
        order by d.name
        
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,dep_filter,fromdate,todate,visit_type], async (err, results, fields) => {
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
                        responseContent: results
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


else 

{

try {
    let facility_uuid = req.headers.facility_uuid;
    let fromdate =req.body.fromdate;
    let todate=req.body.todate;
    let visit_type=req.body.visit_type;


    const selectCountQuery = `

   
    select d.name as diagnosis,

    SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Male_Count",
    SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Female_Count",
    SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=1) THEN 1 ELSE 0 END) AS 'Adult_TG_Count',
    SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Male_Count",
    SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Female_Count",
    SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_TG_Count",

    SUM(CASE WHEN (e.gender_uuid in(1,2,3)) THEN 1 ELSE 0 END) AS "Total_Count"
    
    from 
    patient_diagnosis pd
    join encounter e on e.uuid=pd.encounter_uuid
    join diagnosis d on pd.diagnosis_uuid =d.uuid
    join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
     where  pd.facility_uuid=?    
    and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
    group by d.name 
    order by d.name
`
mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
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
                    responseContent: results
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

}




const view_docDiagnosisVisitwise = async (req, res) => {

    if (req.body.department_uuid>0 )
{

  try {
        let facility_uuid = req.headers.facility_uuid;
        let dep_filter = req.body.department_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;
           let department_uuid1=req.body.department_uuid;


       let doc_uuid = req.headers.user_uuid;

        const selectCountQuery = `
 

        select doctor_uuid,d.name as diagnosis,
        SUM(CASE WHEN (ed.visit_type_uuid=1) THEN 1 ELSE 0 END) AS "First Visit",
        SUM(CASE WHEN (ed.visit_type_uuid=3) THEN 1 ELSE 0 END) AS "Follow up visit",
        SUM(CASE WHEN (ed.visit_type_uuid in (1,3)) THEN 1 ELSE 0 END) AS "Total"
       from 
         patient_diagnosis pd
         join encounter e on e.uuid=pd.encounter_uuid
         join diagnosis d on pd.diagnosis_uuid =d.uuid
         join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
           where pd.department_uuid =? and pd.facility_uuid=?  and doctor_uuid=?  
        and date(ed.created_date) >= ? and date(ed.created_date) <=?
         group by doctor_uuid,d.name 
         order by date(ed.created_date),doctor_uuid,d.name
        
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [department_uuid1,facility_uuid,doc_uuid,dep_filter,fromdate,todate], async (err, results, fields) => {
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
                        responseContent: results
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


else 

{

try {
    let facility_uuid = req.headers.facility_uuid;
    let fromdate =req.body.fromdate;
       let todate=req.body.todate;

   let doc_uuid = req.headers.user_uuid;

    const selectCountQuery = `

   
    select doctor_uuid,d.name as diagnosis,
    SUM(CASE WHEN (ed.visit_type_uuid=1) THEN 1 ELSE 0 END) AS "First Visit",
    SUM(CASE WHEN (ed.visit_type_uuid=3) THEN 1 ELSE 0 END) AS "Follow up visit",
    SUM(CASE WHEN (ed.visit_type_uuid in (1,3)) THEN 1 ELSE 0 END) AS "Total"
   from 
     patient_diagnosis pd
     join encounter e on e.uuid=pd.encounter_uuid
     join diagnosis d on pd.diagnosis_uuid =d.uuid
     join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
      where pd.facility_uuid=?  and doctor_uuid=?  
     and date(ed.created_date) >= ? and date(ed.created_date) <=?
     group by doctor_uuid,d.name 
     order by date(ed.created_date),doctor_uuid,d.name
`
mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,fromdate,todate], async (err, results, fields) => {
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
                    responseContent: results
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

}




const  view_docDiagnosiscount = async (req, res) => {

    if (req.body.department_uuid>0 )
{
  try {
        let facility_uuid = req.headers.facility_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;
           let department_uuid1=req.body.department_uuid;
           let visit_type=req.body.visit_type;



        const selectCountQuery = `
 
           select count(distinct d.name) as count_of_diagnosis
           from
               patient_diagnosis pd
               join encounter e on e.uuid=pd.encounter_uuid
               join diagnosis d on pd.diagnosis_uuid =d.uuid
               join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
                where pd.department_uuid =? and pd.facility_uuid=?  
                and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
            
           
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [department_uuid1,facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
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
                        responseContent: results
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


else 

{

try {
    let facility_uuid = req.headers.facility_uuid;
    let fromdate =req.body.fromdate;
       let todate=req.body.todate;
       let visit_type=req.body.visit_type;



    const selectCountQuery = `

    select count(distinct d.name) as count_of_diagnosis
           from
               patient_diagnosis pd
               join encounter e on e.uuid=pd.encounter_uuid
               join diagnosis d on pd.diagnosis_uuid =d.uuid
               join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
                where  pd.facility_uuid=?    
            and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
              
`
mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
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
                    responseContent: results
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

}


const  view_docDiagnosiscountop = async (req, res) => {

    if(req.headers.user_uuid)

    {

    if (req.body.department_uuid>0 )
{
  try {
        let facility_uuid = req.headers.facility_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;
           let department_uuid1=req.body.department_uuid;
           let doc_uuid = req.headers.user_uuid;


        const selectCountQuery = `
 
           select count(distinct d.name) as count_of_diagnosis
           from
               patient_diagnosis pd
               join encounter e on e.uuid=pd.encounter_uuid
               join diagnosis d on pd.diagnosis_uuid =d.uuid
               join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
                where pd.department_uuid =? and pd.facility_uuid=?  and doctor_uuid=?
                and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=1
            
           
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [department_uuid1,facility_uuid,doc_uuid,fromdate,todate], async (err, results, fields) => {
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
                        responseContent: results
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


else 

{

try {
    let facility_uuid = req.headers.facility_uuid;
    let fromdate =req.body.fromdate;
       let todate=req.body.todate;
       let doc_uuid = req.body.doc_uuid;


    const selectCountQuery = `

    select count(distinct d.name) as count_of_diagnosis
           from
               patient_diagnosis pd
               join encounter e on e.uuid=pd.encounter_uuid
               join diagnosis d on pd.diagnosis_uuid =d.uuid
               join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
                where  pd.facility_uuid=?    and doctor_uuid=?
            and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=1
              
`
mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,fromdate,todate], async (err, results, fields) => {
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
                    responseContent: results
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

}
}





const view_docDiagnosisGengerwiseOP = async (req, res) => {

    if(req.headers.user_uuid)
{
    

    if (req.body.department_uuid>0 )


{

  try {
        let facility_uuid = req.headers.facility_uuid;
        let dep_filter = req.body.department_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;

       let doc_uuid = req.body.doc_uuid;

        const selectCountQuery = `
 

        select doctor_uuid,d.name as diagnosis,

        SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Male_Count",
        SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Female_Count",
        SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=1) THEN 1 ELSE 0 END) AS 'Adult_TG_Count',
        SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Male_Count",
        SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Female_Count",
        SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_TG_Count",

        SUM(CASE WHEN (e.gender_uuid in(1,2,3)) THEN 1 ELSE 0 END) AS "Total_Count"
        
        from 
        patient_diagnosis pd
        join encounter e on e.uuid=pd.encounter_uuid
        join diagnosis d on pd.diagnosis_uuid =d.uuid
        join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
         where pd.facility_uuid=?  and doctor_uuid=? and pd.department_uuid=? 
        and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=1
        group by doctor_uuid,d.name 
        order by date(ed.created_date),doctor_uuid,d.name
        
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,dep_filter,fromdate,todate], async (err, results, fields) => {
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


else 

{

try {
    let facility_uuid = req.headers.facility_uuid;
    let fromdate =req.body.fromdate;
    let todate=req.body.todate;
    let doc_uuid = req.body.doc_uuid;


    const selectCountQuery = `

   
    select doctor_uuid,d.name as diagnosis,

    SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Male_Count",
    SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Female_Count",
    SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=1) THEN 1 ELSE 0 END) AS 'Adult_TG_Count',
    SUM(CASE WHEN (e.gender_uuid=1  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Male_Count",
    SUM(CASE WHEN (e.gender_uuid=2  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Female_Count",
    SUM(CASE WHEN (e.gender_uuid=3  AND e.is_adult=0) THEN 1 ELSE 0 END) AS "Child_TG_Count",

    SUM(CASE WHEN (e.gender_uuid in(1,2,3)) THEN 1 ELSE 0 END) AS "Total_Count"
    
    from 
    patient_diagnosis pd
    join encounter e on e.uuid=pd.encounter_uuid
    join diagnosis d on pd.diagnosis_uuid =d.uuid
    join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
     where  pd.facility_uuid=?  and doctor_uuid=?  
    and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=1
    group by doctor_uuid,d.name 
    order by date(ed.created_date),doctor_uuid,d.name
`
mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,fromdate,todate], async (err, results, fields) => {
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

}
}





const  view_docwisepatientcount = async (req, res) => {

    if (req.body.department_uuid>0 )


{

  try {
        let facility_uuid = req.headers.facility_uuid;
        let dep_filter = req.body.department_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;
           let department_uuid1=req.body.department_uuid;
           let visit_type=req.body.visit_type;



        const selectCountQuery = `
 
        select 
        count(distinct pd.patient_uuid) as patient_count
        
        from patient_diagnosis pd
        join encounter e on e.uuid=pd.encounter_uuid

        join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
         where  pd.department_uuid =? and pd.facility_uuid=?    
         and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
        order by date(ed.created_date)     
                       
           
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [department_uuid1,facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
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
                        responseContent: results
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


else 

{

try {
    let facility_uuid = req.headers.facility_uuid;
    let fromdate =req.body.fromdate;
       let todate=req.body.todate;
       let visit_type=req.body.visit_type;


    const selectCountQuery = `

    select 
    count(distinct pd.patient_uuid) as patient_count
    
    from patient_diagnosis pd
    join encounter e on e.uuid=pd.encounter_uuid

    join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
     where  pd.facility_uuid=?  
     and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
    
    
`
mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
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
                    responseContent: results
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

}



const  view_docwisepatientcountop = async (req, res) => {

    if(req.headers.user_uuid)
    {


    if (req.body.department_uuid>0 )




{

  try {
        let facility_uuid = req.headers.facility_uuid;
        let dep_filter = req.body.department_uuid;
        let fromdate =req.body.fromdate;
           let todate=req.body.todate;
           let department_uuid1=req.body.department_uuid;
           let visit_type=req.body.visit_type;


       let doc_uuid = req.body.doc_uuid;

        const selectCountQuery = `
 
        select doctor_uuid,
        count(distinct pd.patient_uuid) as patient_count
        
        from patient_diagnosis pd
        join encounter e on e.uuid=pd.encounter_uuid

        join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
         where  pd.department_uuid =? and pd.facility_uuid=?  and doctor_uuid=?  
         and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=1
        
         group by doctor_uuid 
        
        order by date(ed.created_date),doctor_uuid     
                       
           
   `
   mysql_pool.mySql_connection.query(selectCountQuery, [department_uuid1,facility_uuid,doc_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
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
                        responseContent: results
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


else 

{

try {
    let facility_uuid = req.headers.facility_uuid;
    let fromdate =req.body.fromdate;
       let todate=req.body.todate;
       let visit_type=req.body.visit_type;

   let doc_uuid = req.body.doc_uuid;

    const selectCountQuery = `

    select doctor_uuid,
    count(distinct pd.patient_uuid) as patient_count
    
    from patient_diagnosis pd
    join encounter e on e.uuid=pd.encounter_uuid

    join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
     where  pd.facility_uuid=?  and doctor_uuid=?  
     and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=1
    
     group by doctor_uuid 
    
    order by date(ed.created_date),doctor_uuid     
    
`
mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,doc_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
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
                    responseContent: results
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

}


}






    return {

        view_depDiagnosis,
        view_docDiagnosis,
        view_docDiagnosisGengerwise,
        view_docDiagnosisGengerwiseOP,
        view_docDiagnosisVisitwise,
        view_docDiagnosiscount,
        view_docDiagnosiscountop,
        view_docwisepatientcount,
        view_docwisepatientcountop

    }























}


module.exports = depDiagnosis_Controller();