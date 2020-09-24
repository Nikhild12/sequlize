const config = require("../config/config");
const rp = require('request-promise');

const appManagerController = ()=>{
   const getDepartments =  async (user_uuid, Authorization, departmentIds)=>{
        //const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/department/getSpecificDepartmentsByIds';
        const url = config.wso2AppUrl + 'department/getSpecificDepartmentsByIds';
    
        let options = {
            uri: url,
            method: 'POST',
            headers: {
                Authorization: Authorization,
                user_uuid: user_uuid,
                'Content-Type': 'application/json'
            },
            body: {
                "uuid": departmentIds
            },
            json: true
        };
    
        const departmentData = await rp(options);
        if (departmentData) {
            return departmentData;
        }
    };
    
    const getDoctorDetails = async (user_uuid, Authorization, doctorIds)=>{
        //const url = 'https://qahmisgateway.oasyshealth.co/DEVAppmaster/v1/api/userProfile/getSpecificUsersByIds';
        const url = config.wso2AppUrl + 'userProfile/getSpecificUsersByIds';
        let options = {
            uri: url,
            method: 'POST',
            headers: {
                Authorization: Authorization,
                user_uuid: user_uuid,
                'Content-Type': 'application/json'
            },
            body: {
                "uuid": doctorIds
            },
            json: true
        };
        const doctorData = await rp(options);
        if (doctorData) {
            return doctorData;
        }
    };
    return {
        getDepartments,
        getDoctorDetails
    };
};

module.exports = appManagerController();
