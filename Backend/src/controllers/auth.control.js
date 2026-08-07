const userModel = require('../models/user.model')
const bcrypt = require("bcryptjs")
const jwttokens = require("jsonwebtoken")
const blacklistModel = require("../models/blacklist.model")


async function userRegisterController(req,res){
    try{
        console.log("REGISTER CONTROLLER HIT");
        const {username, password, email} = req.body
console.log("register body:", req.body);
        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are required , please provide"})
        }

        const users = await userModel.find();

console.log("All users in DB:");
console.log(users);

const use=  await userModel.findOne({ email });

console.log("Searching:", email);
console.log("Found:", use);
        const isalreadyUserExists = await userModel.findOne({
            $or: [{username}, {email}]
        })

        if(isalreadyUserExists){
            return res.status(400).json({message:"Userr already exists wit this useranme and email."})
        }

        const hashPassword = await bcrypt.hash(password, 10)
        
        const user = await userModel.create({
            username,
            email,
            password:hashPassword
        })

        const token = jwttokens.sign(
            {id: user._id, username: user.username}
            ,process.env.JSON_SECRET_KEY
            , {expiresIn: "1d"}
        )

        res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
});

        return res.status(201).json({
            message: "User Created Sucessfully!!",
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
        
    }catch(err){
        console.log("Error occured at userRegisterController!", err)
    }
}


async function userLoginController(req,res){
    try{
        const {email, password} = req.body
console.log("Login body:", req.body);
        if(!email || !password){
            return res.status(400).json("Password and email is required")
        }

        const user = await userModel.findOne({email})

        if(!user){
            return res.status(400).json("User not exists")
        }


        

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            return res.status(400).json("Password is Wrong")
        }

        const token = await jwttokens.sign(
            {id: user._id, username: user.username},
            process.env.JSON_SECRET_KEY,
            {expiresIn: "1d"}
        )

         console.log("Generated JWT:", token);

        // auth.controller.js — userLoginController
res.cookie("token", token, {
    httpOnly: true,
    secure: true,       // ← was false
    sameSite: "none",   // ← was "lax"
    maxAge: 24 * 60 * 60 * 1000
});

console.log("Cookie sent");
console.log("Reached login controller");
console.log("Generated token:", token);

        res.status(201).json({
            message: "LOgin succesfully!!",
            user:{
                id:user._id,
                email:user.email,
                username: user.username
            }
        })

    
        
    }catch (err) {
    console.log(err);
    throw err;
}

    
}

async function userLogoutController(req,res){
    try{
        const token = req.cookies.token

        if(token){
          await blacklistModel.create({token})
        }

        res.clearCookie("token")

         res.status(200).json({
            message:"User Logged Out Sucessfully!!"
        })


    }catch (err) {
    console.log(err);
    throw err;
}


}

async function userGetmeController(req,res){
    try{
        
        const user = await userModel.findById(req.user.id)

         
        res.status(201).json({
            message:"User details Get sucessfully!!",
            user:{
                id:user._id,
                email:user.email,
                username: user.username
            }
        })
 
        
    }catch (err) {
    console.log(err);
    throw err;
}
}

    


module.exports={
    userRegisterController,
    userLoginController,
    userLogoutController,
    userGetmeController
}