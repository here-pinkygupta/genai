const mongoose=require("mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        unique: [true, "Username already taken"],
        require: true
    },
    email:{
        type: String,
        unique: [true, "Account already exists w this username"],
        require: true
    },
    password:{
        type: String,
        require: true
    },
})

const userModel = new mongoose.model("users", userSchema)

module.exports=userModel