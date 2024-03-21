const mongoose = require("mongoose");
const QUeueModel =  mongoose.Schema({
    publickey:{
        type:String
    },
    data:{
        type:String
    },
    type:{
        type:String,
        enum:['Mint','Price','Stake','Unstake','trainingStake','trainingUnstake']
    },
    event_hash:{
        type:String
    },
    hash:{
        type:String,
        default:""
    },
    nonce:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["pending","inprocess"]
    },
    createdat:{
        type:Date,
        default:Date.now()
    }
})

module.exports = mongoose.model("contract_L1",QUeueModel);