const httpStatus = require('http-status');
const mysql_pool = require('../mysql_db/mySqlpool');
const config = require('../config/config');

const rp = require("request-promise");

const db = require("../config/sequelize");
var Sequelize = require('sequelize');
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


//-------------H30-48481
const view_docDiagnosisGengerwise = async (req, res) => {
    try {
        const { facility_uuid } = req.headers;
        const { fromdate, todate, visit_type, dep_filter } = req.body;

        const date_query = fromdate && todate ? ` DATE(ed.created_date) BETWEEN  '${fromdate}' AND '${todate}' ` : ' ';
        const facility_id_query = facility_uuid ? ` AND pd.facility_uuid = ${facility_uuid} ` : ' ';
        const dep_filter_query = dep_filter && dep_filter > 0 ? ` AND pd.department_uuid = ${dep_filter} ` : ' ';
        const encounter_type_query = visit_type ? ` AND e.encounter_type_uuid = ${visit_type} ` : ' ';

        const selectCountQuery = `select
        d.name as diagnosis,
        SUM(CASE WHEN (pd.gender_uuid=1  AND pd.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Male_Count",
         SUM(CASE WHEN (pd.gender_uuid=2  AND pd.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_Female_Count",
         SUM(CASE WHEN (pd.gender_uuid=3  AND pd.is_adult=1) THEN 1 ELSE 0 END) AS "Adult_TG_Count",
         SUM(CASE WHEN (pd.gender_uuid=1  AND pd.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Male_Count",
         SUM(CASE WHEN (pd.gender_uuid=2  AND pd.is_adult=0) THEN 1 ELSE 0 END) AS "Child_Female_Count",
         SUM(CASE WHEN (pd.gender_uuid=3  AND pd.is_adult=0) THEN 1 ELSE 0 END) AS "Child_TG_Count",
 
         SUM(CASE WHEN (pd.gender_uuid in(1,2,3)) THEN 1 ELSE 0 END) AS "Total_Count"
        from patient_diagnosis pd
        join encounter e on e.uuid=pd.encounter_uuid
        join diagnosis d on pd.diagnosis_uuid =d.uuid
        join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
        where `+ date_query + facility_id_query + dep_filter_query + encounter_type_query +
            `group by d.name 
        order by d.name `;

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


//-------------H30-48481





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



// H30-50139 - api issue fix - view_docDiagnosiscount and view_docwisepatcount - start - (Aksa Mohammadi)
// const  view_docDiagnosiscount = async (req, res) => {

//     if (req.body.department_uuid>0 )
// {
//   try {
//         let facility_uuid = req.headers.facility_uuid;
//         let fromdate =req.body.fromdate;
//            let todate=req.body.todate;
//            let department_uuid1=req.body.department_uuid;
//            let visit_type=req.body.visit_type;



//         const selectCountQuery = `
 
//            select count(distinct d.name) as count_of_diagnosis
//            from
//                patient_diagnosis pd
//                join encounter e on e.uuid=pd.encounter_uuid
//                join diagnosis d on pd.diagnosis_uuid =d.uuid
//                join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
//                 where pd.department_uuid =? and pd.facility_uuid=?  
//                 and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
            
           
//    `
//    mysql_pool.mySql_connection.query(selectCountQuery, [department_uuid1,facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
//     try {
     

//         if (err) {
//             res
//                 .status(400)
//                 .send({
//                     code: httpStatus.BAD_REQUEST,
//                     message: 'Failed to get data!',
//                     error: err
//                 });
//         }
//         else {
//             if (!results[0]) {
//                 res
//                     .status(200)
//                     .send({
//                         code: httpStatus.OK,
//                         message: 'No respective  data were found!',
//                         responseContent: []
//                     });
//             }
//             else {
               
//                 res
//                     .status(200)
//                     .send({
//                         code: httpStatus.OK,
//                         message: 'Data fetched successfully!',
//                         responseContent: results
//                     });
//             }
//         }
//     } catch (error) {
//         res
//             .status(400)
//             .send({ message: error.message, error: error })
//     }
// });
// } catch (error) {
// res
//     .status(400)
//     .send({ message: error.message, error: error });
// }


// }


// else 

// {

// try {
//     let facility_uuid = req.headers.facility_uuid;
//     let fromdate =req.body.fromdate;
//        let todate=req.body.todate;
//        let visit_type=req.body.visit_type;



//     const selectCountQuery = `

//     select count(distinct d.name) as count_of_diagnosis
//            from
//                patient_diagnosis pd
//                join encounter e on e.uuid=pd.encounter_uuid
//                join diagnosis d on pd.diagnosis_uuid =d.uuid
//                join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
//                 where  pd.facility_uuid=?    
//             and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
              
// `
// mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
// try {
   

//     if (err) {
//         res
//             .status(400)
//             .send({
//                 code: httpStatus.BAD_REQUEST,
//                 message: 'Failed to get data!',
//                 error: err
//             });
//     }
//     else {
//         if (!results[0]) {
//             res
//                 .status(200)
//                 .send({
//                     code: httpStatus.OK,
//                     message: 'No respective  data were found!',
//                     responseContent: []
//                 });
//         }
//         else {
       

//             res
//                 .status(200)
//                 .send({
//                     code: httpStatus.OK,
//                     message: 'Data fetched successfully!',
//                     responseContent: results
//                 });
//         }
//     }
// } catch (error) {
//     res
//         .status(400)
//         .send({ message: error.message, error: error })
// }
// });
// } catch (error) {
// res
// .status(400)
// .send({ message: error.message, error: error });
// }



// }

// }

const view_docDiagnosiscount = async (req, res, next) => {
    try {
        const {fromdate, todate ,department_uuid, visit_type} = req.body;
        const {facility_uuid, user_uuid} = req.headers;
        
        const facility_uuid_query = facility_uuid ? `AND pd.facility_uuid= ${facility_uuid}` : '';
        const date_query = fromdate && todate ? `AND DATE(pd.created_date) BETWEEN  '${fromdate}' AND '${todate}' ` : ' ';
       
        const department_uuid_query = department_uuid && department_uuid > 0 ? `AND pd.department_uuid = ${department_uuid} ` : ' '; 

        const encounter_type_query = visit_type ? ` AND e.encounter_type_uuid = ${visit_type} ` : ' ';        
        
        var _query = `SELECT COUNT(pd.uuid) AS count_of_diagnosis
                        FROM patient_diagnosis pd
                            JOIN encounter e ON e.uuid = pd.encounter_uuid
                        WHERE pd.is_active = 1 
                            ${department_uuid_query} ${facility_uuid_query} 
                            ${date_query} ${encounter_type_query};`

        const results = await db.sequelize.query(_query, {
            type: Sequelize.QueryTypes.SELECT
        });

        if (results && results.length > 0) {
            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: httpStatus.OK,
                    msg: "Get Details Fetched successfully",
                    responseContents: results
                });
        } else {
            return res
                .status(httpStatus.OK)
                .json({ status: "success", statusCode: httpStatus.OK, msg: 'data not found' });
        }

    } catch (err) {
        const errorMsg = err.errors ? err.errors[0].message : err.message;
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ status: "API Server Error ", msg: errorMsg });
    }
}

// H30-50139 - api issue fix - view_docDiagnosiscount and view_docwisepatcount - end - (Aksa Mohammadi)


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




// H30-50139 - api issue fix - view_docDiagnosiscount and view_docwisepatcount - start - (Aksa Mohammadi)
// const  view_docwisepatientcount = async (req, res) => {

//     if (req.body.department_uuid>0 )


// {

//   try {
//         let facility_uuid = req.headers.facility_uuid;
//         let dep_filter = req.body.department_uuid;
//         let fromdate =req.body.fromdate;
//            let todate=req.body.todate;
//            let department_uuid1=req.body.department_uuid;
//            let visit_type=req.body.visit_type;



//         const selectCountQuery = `
 
//         select 
//         count(distinct pd.patient_uuid) as patient_count
        
//         from patient_diagnosis pd
//         join encounter e on e.uuid=pd.encounter_uuid

//         join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
//          where  pd.department_uuid =? and pd.facility_uuid=?    
//          and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
//         order by date(ed.created_date)     
                       
           
//    `

//    mysql_pool.mySql_connection.query(selectCountQuery, [department_uuid1,facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
//     try {
     

//         if (err) {
//             res
//                 .status(400)
//                 .send({
//                     code: httpStatus.BAD_REQUEST,
//                     message: 'Failed to get data!',
//                     error: err
//                 });
//         }
//         else {
//             if (!results[0]) {
//                 res
//                     .status(200)
//                     .send({
//                         code: httpStatus.OK,
//                         message: 'No respective  data were found!',
//                         responseContent: []
//                     });
//             }
//             else {
               
//                 res
//                     .status(200)
//                     .send({
//                         code: httpStatus.OK,
//                         message: 'Data fetched successfully!',
//                         responseContent: results
//                     });
//             }
//         }
//     } catch (error) {
//         res
//             .status(400)
//             .send({ message: error.message, error: error })
//     }
// });
// } catch (error) {
// res
//     .status(400)
//     .send({ message: error.message, error: error });
// }


// }


// else 

// {

// try {
//     let facility_uuid = req.headers.facility_uuid;
//     let fromdate =req.body.fromdate;
//        let todate=req.body.todate;
//        let visit_type=req.body.visit_type;


//     const selectCountQuery = `

//     select 
//     count(distinct pd.patient_uuid) as patient_count
    
//     from patient_diagnosis pd
//     join encounter e on e.uuid=pd.encounter_uuid

//     join encounter_doctors ed on ed.uuid =pd.encounter_doctor_uuid
//      where  pd.facility_uuid=?  
//      and date(ed.created_date) >= ? and date(ed.created_date) <=? and e.encounter_type_uuid=?
    
    
// `
// mysql_pool.mySql_connection.query(selectCountQuery, [facility_uuid,fromdate,todate,visit_type], async (err, results, fields) => {
// try {
   

//     if (err) {
//         res
//             .status(400)
//             .send({
//                 code: httpStatus.BAD_REQUEST,
//                 message: 'Failed to get data!',
//                 error: err
//             });
//     }
//     else {
//         if (!results[0]) {
//             res
//                 .status(200)
//                 .send({
//                     code: httpStatus.OK,
//                     message: 'No respective  data were found!',
//                     responseContent: []
//                 });
//         }
//         else {
       

//             res
//                 .status(200)
//                 .send({
//                     code: httpStatus.OK,
//                     message: 'Data fetched successfully!',
//                     responseContent: results
//                 });
//         }
//     }
// } catch (error) {
//     res
//         .status(400)
//         .send({ message: error.message, error: error })
// }
// });
// } catch (error) {
// res
// .status(400)
// .send({ message: error.message, error: error });
// }



// }

// }


//department uuid is compulsory
const view_docwisepatientcount = async (req, res, next) => {
    try {
        const {fromdate, todate ,department_uuid, visit_type} = req.body;
        const {facility_uuid, user_uuid} = req.headers;
        
        const facility_uuid_query = facility_uuid ? `AND pd.facility_uuid= ${facility_uuid}` : '';
        const date_query = fromdate && todate ? `AND DATE(pd.created_date) BETWEEN  '${fromdate}' AND '${todate}' ` : ' ';
       
        const department_uuid_query = department_uuid && department_uuid > 0 ? `AND pd.department_uuid = ${department_uuid} ` : ' '; //department uuid is compulsory
        const encounter_type_query = visit_type ? ` AND e.encounter_type_uuid = ${visit_type} ` : ' ';

        var _query = `SELECT COUNT(distinct pd.patient_uuid) AS patient_count 
                        FROM patient_diagnosis pd 
                                JOIN encounter e on e.uuid=pd.encounter_uuid
                        WHERE  
                                pd.is_active = 1 
                                ${department_uuid_query}  ${facility_uuid_query} ${date_query}  ${encounter_type_query}
                        ORDER BY
                                date(pd.created_date) ;`
        
        const results = await db.sequelize.query(_query, {
            type: Sequelize.QueryTypes.SELECT
        });

        if (results && results.length > 0) {
            return res
                .status(httpStatus.OK)
                .json({
                    statusCode: httpStatus.OK,
                    msg: "Get Details Fetched successfully",
                    responseContents: results
                });
        } else {
            return res
                .status(httpStatus.OK)
                .json({ status: "success", statusCode: httpStatus.OK, msg: 'data not found' });
        }

    } catch (err) {
        const errorMsg = err.errors ? err.errors[0].message : err.message;
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ status: "API Server Error ", msg: errorMsg });
    }
}
// H30-50139 - api issue fix - view_docDiagnosiscount and view_docwisepatcount - end - (Aksa Mohammadi)


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