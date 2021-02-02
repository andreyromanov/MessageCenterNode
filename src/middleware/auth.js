require('dotenv').config();

module.exports = function isAuthorized(req, res, next) {
    if (req.get("Authorization") === "12345") {
        next();
    } else if (req.header('x-viber-content-signature') && req.header('host') === process.env.ORIGIN) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};