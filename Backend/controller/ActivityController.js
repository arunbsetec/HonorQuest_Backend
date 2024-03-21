const Activity = require('../model/activitymodel')

const vaultStack = async(req,res) =>{
    try{
        const {address,tokenId,type} = req.body;
        const activity = new Activity({publicKey:address,tokenId:tokenId,type:type,Message:`TokenID ${tokenId} Moved to the Vault Successfully`})
        await activity.save();
        console.log(Activity,"=============vault Stack")
        return res.status(200).json({status:true,data:activity});
    }
    catch(e){
        console.log(e,"=========error");
        return res.status(500).json({status:false,message:`vault stack : ${e}`})
    }
}

const vaultUnstack = async(req,res) =>{
    try{
        const {address,tokenId,type} = req.body;
        const activity = new Activity({publicKey:address,tokenId:tokenId,type:type,Message:`TokenID ${tokenId} Moved to the Mint Section Successfully`})
        await activity.save();
        console.log(Activity,"=============vault Stack")
        return res.status(200).json({status:true,data:activity});
    }
    catch(e){
        console.log(e,"+==========error")
        return res.status(500).json({status:false,message:`vault Unstack : ${e}`})
    }
}

const getAllActivity = async (req,res) =>{
    try{
        const id = req.params.id;
        const result = await Activity.find({publicKey:id}).sort({ createdAt: -1 });
        console.log(result,"========result")
        return res.status(200).json({status:true,data:result})
    }
    catch(e){
        console.log(e,"=========error");
        return res.status(500).json({status:false,error:e})
    }
}

const getIdActivity = async (req,res) =>{
    try{
        const id = req.params.id;
        const result = await Activity.find({_id:id})
        console.log(result,"============result")
        return res.status(200).json({status:true,data:result})
    }
    catch(error){
        console.log(error,"======error");
        return res.status(500).json({status:false,error:error})
    }
}
module.exports={
    vaultStack,
    vaultUnstack,
    getAllActivity,
    getIdActivity
}