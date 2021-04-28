const config = require("../config/config");
const rp = require('request-promise');

const appManagerController = () => {
    const getDepartments = async (user_uuid, Authorization, departmentIds) => {
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

    const getDoctorDetails = async (user_uuid, Authorization, doctorIds) => {
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

    const getFacilityDetailsById = async (user_uuid, Authorization, facilityId) => {
        const url = config.wso2AppUrl + 'facility/getFacilityById';
        let options = {
            uri: url,
            method: 'POST',
            headers: {
                Authorization: Authorization,
                user_uuid: user_uuid,
                'Content-Type': 'application/json'
            },
            body: {
                "Id": facilityId
            },
            json: true
        };

        const facilityData = await rp(options);
        if (facilityData) {
            return facilityData;
        }
    };

    const getPatientById = async (user_uuid, Authorization, patientId) => {
        const url = config.wso2RegisrationUrl + 'patient/getById';
        let options = {
            uri: url,
            method: 'POST',
            headers: {
                Authorization: Authorization,
                user_uuid: user_uuid,
                'accept-language': 'eng',
                'Content-Type': 'application/json'
            },
            body: {
                "patientId": patientId
            },
            json: true
        };

        const patientData = await rp(options);
        if (patientData) {
            return patientData;
        }
    };

    return {
        getDepartments,
        getDoctorDetails,
        getFacilityDetailsById,
        getPatientById
    };
};

module.exports = appManagerController();
