function Authenticate(req, res, next) {
    //Logging - 19_02_2020
    const config = require('../config/config');
    config.requestDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata'
    });
    //Logging - 19_02_2020
    if (req && req.headers && req.headers.user_uuid && req.headers.user_uuid > 0) {
        next();
    } else {
        return res.status(403).json({
            code: 'Forbidden',
            message: "You are not Authorized"
        });
    }
}

module.exports = Authenticate;