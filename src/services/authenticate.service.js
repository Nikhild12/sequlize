function Authenticate(req, res, next) {

    if (req && req.headers && req.headers.user_uuid && req.headers.user_uuid > 0) {
        next();
    } else {
        return res.status(403).json({ code: 'Forbidden', message: "You are not Authorized" });
    }
}

module.exports = Authenticate;