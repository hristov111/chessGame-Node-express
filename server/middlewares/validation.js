
const {validationResult} = require('express-validator');


const validate = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())return res.status(400).json({errors:errors.array()});

    next();
}

const requireAdmin = (req,res,next) => {
    if(req.session?.user?.isAdmin){
        return next();
    }
    return res.status(403).json({msg:"Admins only"});
}

const requireLogin = (req,res,next) => {
    console.log(req.session);
    if(!req.session.user){
        console.log('not authorised');
        return res.status(401).json({msg: "Unauthorized"});
    }
    next();
}

module.exports = {validate, requireLogin,requireAdmin};