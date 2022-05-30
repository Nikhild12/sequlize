var rp = require('request-promise');
const config = require('../config/config');
const getResults = async (url, req, data) => {
    try {
        const _url = config.wso2AppUrl + url;
        const { user_uuid, facility_uuid, authorization } = req.headers;
        let options = {
            uri: _url,
            headers: {
                user_uuid,
                facility_uuid,
                Authorization: authorization
            },
            method: "POST",
            json: true // Automatically parses the JSON string in the response
        };

        if (data) {
            options.body = data;
        }
        const results = await rp(options);
        return results;
    } catch (e) { // deepscan-disable-line
        throw e;
    }
};

module.exports = { getResults };


