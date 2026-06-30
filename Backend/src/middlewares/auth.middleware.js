const jwt = require('jsonwebtoken')
const blacklistTokensModel = require("../models/blacklist.model")

async function authUser(req,res,next){

    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message: "Token is not proviede"
        })
    }

    const isTokenBlacklisted =await  blacklistTokensModel.findOne({token})

    if(isTokenBlacklisted){
        res.status(401).json({
            message: "Token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JSON_SECRET_KEY)

        req.user = decoded

        next()
    }catch(err){
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}

module.exports=authUser