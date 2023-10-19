const jwt = require('jwt-simple');
const moment = require('moment');

const libjwt = require('../services/jwt');
const secret = libjwt.secret;

const blacklist = new Set();

module.exports.blacklist = blacklist;
exports.auth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: 'Error',
            message: 'Request doesnt have any authorization headers'
        })
    }
    let token = req.headers.authorization.replace(/['"]+/g, '');
    if (blacklist.has(token)) {
        return res.status(401).send({
            status: 'Error',
            error: 'Login to continue'
        })
    }
    let payload = jwt.decode(token, secret);
    try {
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                status: 'Error',
                message: 'Token expired'
            })
        }
    } catch(error) {
        return res.status(404).send({
            status: 'Error',
            message: 'Token not valid',
            error
        })
    }
    req.user = payload;
    req.user.token = token;
    next();
}