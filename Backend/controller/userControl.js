const crypto = require('crypto');
const ethers = require('ethers');
const Queue = require('../model/queuemodel');
const Questabi = require('../abi/L2/queststaking.json')
const NFTabi = require('../abi/L2/nft.json');
const L1NFTabi = require('../abi/L1/L1Nft.json');
const L1Vaultabi = require("../abi/L1/Vault.json");
const config = require('../config');
const blockchainUtils = require("../helper/blockchainUtils")
const helper = require('../helper/eventhelper')
const queueController = require('../controller/queueController')

const stake = async (req, res) => {
  try {
    const { address, tokenIds, characters} = req.body;
    console.log(req.body,'===========req.body');
    if (!address) {
      return res.status(400).json({ status: false, message: "Address is required" });
    }
    if (!tokenIds) {
      return res.status(400).json({ status: false, message: "TokenIds are required" });
    }
    if (!characters) {
      return res.status(400).json({ status: false, message: "Character are required" });
    }
    const event_hash=crypto.randomBytes(64).toString('hex');
    console.log(event_hash,'=========================================================event_hash');
    
    const content = {
        to:address,
        type:"Stake",
        tokenIds:tokenIds,
        characters:characters
    }
    const contents = JSON.stringify(content);
    const existingTransaction = await Queue.findOne({ event_hash: event_hash });
    if(!existingTransaction){
      const identifer =await queueController.pendingTxNonce()
      console.log(identifer,"================identifer")
        const data = new Queue({ data:contents,publickey:address,type:"Stake",event_hash: event_hash,nonce:identifer, status: "pending" });
        console.log(data,"==========data of the stake function in backend")
        await data.save();
        // await helper.Stake()
        const Quest = await helper.questStack(address,tokenIds,characters,identifer);
        res.status(201).json({ status: true, message: 'Stake Stored Successfull' });
    }
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: 'Stake Stored failed' });
  }
}

  const unstake = async (req, res) => {
  try {
    const { address, tokenIds, characters } = req.body;
    if (!address) {
      return res.status(400).json({ status: false, message: "Address is required" });
    }
    if (!tokenIds) {
      return res.status(400).json({ status: false, message: "TokenIds are required" });
    }
    if (!characters) {
      return res.status(400).json({ status: false, message: "Character are required" });
    }

    const event_hash=crypto.randomBytes(64).toString('hex');
    console.log(event_hash,'=========================================================Unstake event_hash');
    
    const content = {
        to:address,
        type:"Unstake",
        tokenIds:tokenIds,
        characters:characters
    }
    const contents = JSON.stringify(content);
    console.log(contents,"=============contents")
    const existingTransaction = await Queue.findOne({ event_hash: event_hash });
    if(!existingTransaction){
        const data = new Queue({ data:contents,publickey:address,type:"Unstake",event_hash: event_hash, status: "pending" });
        await data.save();
        const identifer =await queueController.pendingTxNonce()
        console.log(identifer,"================identifer")
        await helper.questUnstack(address,tokenIds, characters,identifer)
        res.status(201).json({ status: true, message: 'Unstake Stored Successfull' });
    }
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: 'Unstake Stored failed' });
  }
};

const getmintedtokens = async(req,res) => {
  try{
      const address  = req.params.address;
      // console.log(address,"=================================address")
      if (!address) {
          return res.status(400).json({ status: false, message: "Address is required" });
      }
      const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
      const signer = new ethers.Wallet(config.Prv_key,provider);
      const L1Nft = new ethers.Contract(config.L1NFT,L1NFTabi,signer);
      const L2Nft = new ethers.Contract(config.NFT,NFTabi,signer);
      const Vault = new ethers.Contract(config.L1Vault,L1Vaultabi,signer);

      let L1=await L1Nft.tokensOfOwnerByRange(address);
      let L1tokens = L1.toString().split(",");
      console.log(L1tokens,"=================================L1")

      let vault = await Vault.getVaultTokens(address);
      let vaulttokens = vault.toString().split(",");
       console.log(vaulttokens,"=================================vault")

      let L2=await L2Nft.getmintedTokens(address);
      let L2tokens = L2.toString().split(",");
      console.log(L2tokens,"========================L2")

      L2tokens=L2tokens.filter(token => !vaulttokens.includes(token));
      console.log(L2tokens,"===========updated token")

      let tokens = L1tokens.filter(token => !L2tokens.includes(token))
      let mintedTokens = tokens.concat(L2tokens)

      console.log(mintedTokens,"=================================final array")
       res.status(201).json({ status: true, message: 'Got the minted tokens', tokens:mintedTokens });
  }catch(error){
      console.log(error)
      res.status(500).json({ status: false, message: 'Minted tokens failed', error:error }); 
  }
}

const getNFTtokenUri = async(req,res) => {
    try{
        const tokenId  = req.params.tokenId;
        if (!tokenId) {
            return res.status(400).json({ status: false, message: "TokenID is required" });
        }
        const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
        const signer = new ethers.Wallet(config.Prv_key, provider);
        const Instance = new ethers.Contract(config.NFT, NFTabi, signer);
        const NFT = await Instance.tokenURI(tokenId);
        console.log(NFT.toString())
         res.status(201).json({ status: true, message: 'Token URI successfully returned', tokenUri:NFT.toString() });
    }catch(error){
        console.log(error)
        res.status(500).json({ status: false, message: 'Token URI failed', error:error }); 
    }
}
  
const gen0Signature = async(req,res) =>{
  try{
    const {address,quantity} = req.body;
    console.log(req.body,"=========req.body")
    if(address == null || address == "" || address == undefined){
      return res.status(400).json({status:false,message:"Address is required"})
    }
    if(quantity <= 0){
      return res.status(400).json({status:false,message:"Quantity Must be greater than 0"})
    }
    const result = await blockchainUtils.gen0Signature(address,quantity)
    console.log(result,"===========result")
    return res.status(200).json({status:true,message:result})
  }
  catch(error){
    console.log("error:",error)
    return res.status(500).json({status:false,message:error})
  }
}


const claimQuestReward = async(req,res) =>{
  try{
    const {address,tokenId,character}= req.body;
    const nonce =await queueController.pendingTxNonce()
    const claimReward = await helper.claimReward(address,tokenId,character,nonce)
    console.log(claimReward,"=========claim Quest Reward")
    return res.status(200).json({status:true,message:claimReward})
  }
  catch(e){
    console.log("error:",e)
    return res.status(500).json({status:false,message:e})
  }
}

const TrainingStack = async(req,res) =>{
  try{
    const {address,tokenId,character} = req.body;
    const event_hash=crypto.randomBytes(64).toString('hex');
    console.log(event_hash,'=========================================================event_hash');
    
    const content = {
        to:address,
        type:"trainingStake",
        tokenIds:tokenId,
        characters:character
    }
    const contents = JSON.stringify(content);
    const existingTransaction = await Queue.findOne({ event_hash: event_hash });
    if(!existingTransaction){
      const identifer =await queueController.pendingTxNonce()
      console.log(identifer,"================identifer")
        const data = new Queue({ data:contents,publickey:address,type:"trainingStake",event_hash: event_hash,nonce:identifer, status: "pending" });
        console.log(data,"==========data of the stake function in backend")
        await data.save();
        // const Trainingstack = await helper.trainingStack(address,tokenId,character,identifer)
        // console.log(Trainingstack,"=============trainingStack");
        return res.status(200).json({status:true,message:data})
    }
  }
  catch(e){
    console.log("error:",e);
    return res.status(500).json({status:false,message:e})
  }
}

const TrainingUnstack = async(req,res) =>{
  try{
    const {address,tokenId,character} = req.body;
    const event_hash=crypto.randomBytes(64).toString('hex');
    console.log(event_hash,'=========================================================event_hash');
    
    const content = {
        to:address,
        type:"trainingUnstake",
        tokenIds:tokenId,
        characters:character
    }
    const contents = JSON.stringify(content);
    const existingTransaction = await Queue.findOne({ event_hash: event_hash });
    if(!existingTransaction){
      const identifer =await queueController.pendingTxNonce()
      console.log(identifer,"================identifer")
        const data = new Queue({ data:contents,publickey:address,type:"trainingUnstake",event_hash: event_hash,nonce:identifer, status: "pending" });
        console.log(data,"==========data of the stake function in backend")
        await data.save();
        // const Trainingstack = await helper.trainingUnstack(address,tokenId,character,identifer)
        // console.log(Trainingstack,"=============trainingStack");
        return res.status(200).json({status:true,message:data})
    }
  }
  catch(e){
    console.log("error:",e);
    return res.status(500).json({status:false,message:e})
  }
}



module.exports = {
  stake,
  unstake,
  getmintedtokens,
  getNFTtokenUri,
  gen0Signature,
  claimQuestReward,
  TrainingStack,
  TrainingUnstack
};

