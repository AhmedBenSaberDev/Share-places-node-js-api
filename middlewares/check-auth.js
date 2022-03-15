const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');


module.exports = (req,res,next) => {
    try {
        let token = req.headers.authorization.split(' ')[1];
        if(!token){
            const error = new HttpError('Authentification failed',500);
            return next(error);
        }
        const decodedToken = jwt.verify(token,'supersecret')
        req.userData = {userId:decodedToken.userId}
        next()
    } catch (err) {
        const error = new HttpError('Authentification failed',500);
        return next(error);
    }
}