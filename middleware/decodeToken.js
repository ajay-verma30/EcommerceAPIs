const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY;

const authenticateToken = (req,res, next)=>{
    const token = req.header('Authorization')?.split(' ')[1];
    if(!token){
    return res.status(403).json({message:"Access denied, No token provided"});
    }
    jwt.verify(token, secretKey, (err, decoded)=>{
        if(err){
           return res.status(403).json({message:"Invalid or expired token"});
        }
        req.user = decoded;
        next();
    })
}

module.exports = authenticateToken;