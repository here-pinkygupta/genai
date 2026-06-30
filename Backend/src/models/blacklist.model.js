const mongoose = require("mongoose")

const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type: String,
        require:[true, "Token are required for blacklisting"]
    }
},{timestamps:true})

const blacklistModel = new mongoose.model("blacklistTokens", blacklistTokenSchema)

module.exports = blacklistModel