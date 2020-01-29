const validate = (postData,must_be_present) => {
    let errors = "";
    for (let ele of must_be_present) {
        if (!postData[ele]) {
            errors += errors ? ", " + ele : ele;
            //console.log("Not Present:", errors);
        }
    }
    return send(errors);
};
const validate_header = (header) => {
    //console.log('user_uuid:', header.user_uuid);
    // console.log('facility_uuid:', header.facility_uuid);
    let errors = '';
    if (!(parseInt(header.user_uuid) > 0)) {
        errors += "user_uuid";
    }
    if (!(parseInt(header.facility_uuid) > 0)) {
        if (errors) errors += " and ";
        errors += "facility_uuid";
    }
    return send(errors);
};

const send = (errors) => {
    //console.log(errors);
    if (errors) {
        errors += " Must Be Provided";
        return {status:false,errors};
    } else {
        return {status:true};
    }
};

module.exports = {validate,validate_header,send};