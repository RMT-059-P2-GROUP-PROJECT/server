const { verifyToken } = require("../helpers/jwt");
const {User} = require('../models');

const AuthenticationMiddleware = async(req, res, next) => {
    try {
        const { authorization } = req.headers;
        if(!authorization) {
            throw { name: 'Unauthorized', message: 'Invalid token' };
        }

        const authorizationText = authorization.split(" ")
        if(authorizationText[0] !== 'Bearer' || !authorizationText[1]) {
            throw { name: 'Unauthorized', message: 'Invalid token' };
        }

        const authResult = verifyToken(authorizationText[1]);
        if(!authResult) {
            throw { name: 'Unauthorized', message: 'Invalid token' };
        }

        const user = await User.findByPk(authResult.id);
        if(!user) {
            throw { name: 'Unauthorized', message: 'Invalid token' };
        }
        req.user = user
        next()
    } catch (error) {
        next(error);
    }
}

module.exports = AuthenticationMiddleware;
