const httpStatus = require("http-status");
const rp = require('request-promise');

const snomedController = () => {

    /**
   * Returns jwt token if valid username and password is provided
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */

   const _getsnomeddetails = async (req, res) => {

        try {

            let userUUID = req.headers.user_uuid;
            let searchkey = req.query;

            if (userUUID) {
                const updated = await getSNOMED(searchkey);
                var myData = Object.keys(updated.bucketConcepts).map(key => {
                    let matchdata = updated.bucketConcepts[key];
                    matchdata = {
                        'ConceptId': matchdata.conceptId,
                        'ConceptName': matchdata.term || matchdata.fsn.term || matchdata.fsn || '',
                    };
                    return matchdata;
                });

                if (updated) {
                    return res.status(200).send({ code: httpStatus.OK, "Snomed_data": myData, message: "snomed details fetched Successfully" });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: err.message });
        }
    };

    const _getsnomedparent = async (req, res) => {

        try {

            let userUUID = req.headers.user_uuid;
            let searchkey = req.query;

            if (userUUID) {
                const updated = await getSNOMEDparent(searchkey);
                var myData = Object.keys(updated).map(key => {
                    let matchdata = updated[key];
                    matchdata = {
                        'ConceptId': matchdata.conceptId,
                        'ConceptName': matchdata.term || matchdata.fsn.term || matchdata.fsn || '',
                    };
                    return matchdata;
                });

                if (updated) {
                    return res.status(200).send({ code: httpStatus.OK, "Snomed_Parent_data": myData, message: "snomed details fetched Successfully" });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: err.message });
        }
    };
    
    const _getsnomedchildren = async (req, res) => {

        try {

            let userUUID = req.headers.user_uuid;
            let searchkey = req.query;

            if (userUUID) {
                const updated = await getSNOMEDchildren(searchkey);
                var myData = Object.keys(updated).map(key => {
                    let matchdata = updated[key];
                    matchdata = {
                        'ConceptId': matchdata.conceptId,
                        'ConceptName': matchdata.term || matchdata.fsn.term || matchdata.fsn || '',
                    };
                    return matchdata;
                });

                if (updated) {
                    return res.status(200).send({ code: httpStatus.OK, "Snomed_Children_data": myData, message: "snomed details fetched Successfully" });
                }
            }
            else {
                return res.status(400).send({ code: httpStatus[400], message: "No Request Body Found" });
            }
        } catch (err) {
            return res.status(400).send({ code: httpStatus.BAD_REQUEST, message: err.message });
        }
    };

    return {
        getsnomeddetails: _getsnomeddetails,
        getsnomedparent: _getsnomedparent,
        getsnomedchildren: _getsnomedchildren
    };

};

module.exports = snomedController();

async function getSNOMED(searchkey) {
    let key = Object.values(searchkey);
    let options = {
        uri: 'https://browser.ihtsdotools.org/snowstorm/snomed-ct/browser/MAIN/SNOMEDCT-US/2020-03-01/descriptions?&limit=100&term=' +key+ '&active=true',
        method: 'GET',
        json: true
    };
    const SNOMED_details = await rp(options);
    return SNOMED_details;
}

async function getSNOMEDparent(searchkey) {
    let key = Object.values(searchkey);
    let options = {
        uri: 'https://browser.ihtsdotools.org/snowstorm/snomed-ct/browser/MAIN/concepts/'+key+'/parents',
        method: 'GET',
        json: true
    };
    const SNOMED_details = await rp(options);
    return SNOMED_details;
}

async function getSNOMEDchildren(searchkey) {
    let key = Object.values(searchkey);
    let options = {
        uri: 'https://browser.ihtsdotools.org/snowstorm/snomed-ct/browser/MAIN/concepts/'+key+'/children',
        method: 'GET',
        json: true
    };
    const SNOMED_details = await rp(options);
    return SNOMED_details;
}