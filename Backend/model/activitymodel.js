const mongoose = require("mongoose");
const ActivityModel =  mongoose.Schema({
    publicKey:{
        type:String
    },
    tokenId:{
        type:Array
    },
    type:{
        type:String,
        enum:['Mint','Stack','Unstack','Vault','Unvault','Training','Untraining','Deposite','Claim']
    },
    Message:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
module.exports = mongoose.model("ActivityControl",ActivityModel);