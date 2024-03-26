const ethers = require('ethers');
const NFTabi = require('../abi/L2/nft.json');
const Questabi = require('../abi/L2/queststaking.json')
const Trainingabi = require('../abi/L2/training.json')
const L1NFTabi = require('../abi/L1/L1Nft.json');
require("dotenv").config()
const Queue = require('../model/queuemodel')
const Activity = require('../model/activitymodel')
const config = require('../config');
const { sendTxWithNonce } = require('../helper/blockchainUtils');
const e = require('cors');
const { L2ContractConnection } = require('../controller/streamController');
const { eth } = require('web3');


async function L2mint(to, amounts, pendingTransaction, hash) {
  console.log(to, amounts, pendingTransaction, hash, "==================l2 mint data");
  try {
    const L2provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, L2provider);
    const L2ContractInstace = new ethers.Contract(config.NFT, NFTabi, signer);


    const result = await sendTxWithNonce(L2ContractInstace, 'mint', [to, amounts, pendingTransaction], hash);
    console.log("After sending transaction");
    console.log(result, "================ L2ContractInstace result of mint on L2");
    if (result.hash) {
      const activityModel = new Activity({ publicKey: to, tokenId: amounts, type: "Mint", Message: `TokenId ${amounts} Minted Sucessfully to your Account` })
      await activityModel.save()
      await updatemodel(hash, result.hash);
      return result
    } else {
      console.log("something went Wrong");
      return
    }
  } catch (e) {
    console.log("Error in L2mint:", e);
  }
}


const questStack = async (address, tokenId, characters, identifer) => {
  try {
    console.log(address, tokenId, characters, identifer, "======================address,tokenId,characters,identifer")
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Quest = new ethers.Contract(config.QuestStake, Questabi, signer);
    const Nft = new ethers.Contract(config.NFT, NFTabi, signer);
    const approve = await Nft.batchapprove(config.QuestStake, tokenId)
    console.log(approve, "===========approved or not")
    // const stake = await Quest.tokenstake(address,tokenId,characters,{gasLimit:2000000})
    // console.log(stake,"========stake")
    const stake = await sendTxWithNonce(Quest, "tokenstake", [address, tokenId, characters, identifer])
    console.log(stake, "======stacke in Quest")
    const getStackedTokens = await Quest.getStakedTokens(address)
    console.log(getStackedTokens.toString(), "=============stacked token in quest");
    if (stake.hash) {
      const activityModel = new Activity({ publicKey: address, tokenId: tokenId, type: "Stack", Message: `TokenId ${tokenId} Stacked in the Quest Sucessfully` })
      await activityModel.save();
      await updatemodel(identifer, stake.hash);
      return stake
    } else {
      console.log("something worng in the QuestStak")
      return
    }
  }
  catch (e) {
    console.log(e)
    return e;
  }
}

const questUnstack = async (address, tokenId, characters, identifer) => {
  try {
    console.log("quest unstake is called", address, tokenId, characters, identifer)
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Quest = new ethers.Contract(config.QuestStake, Questabi, signer);
    const Nft = new ethers.Contract(config.NFT, NFTabi, signer);
    const stake = await sendTxWithNonce(Quest, "tokenUnstake", [address, tokenId, characters, identifer])
    console.log(stake, "======stacke in Quest")
    const getStackedTokens = await Quest.getStakedTokens(address)
    console.log(getStackedTokens.toString(), "=============stacked token in quest")
    if (stake.hash) {
      const activityModel = new Activity({ publicKey: address, tokenId: tokenId, type: "Unstack", Message: `TokenId ${tokenId} Unstaced in the Quest Sucessfully` })
      await activityModel.save();
      await updatemodel(identifer, stake.hash);
      return stake
    } else {
      console.log("something worng in the QuestStak")
      return
    }
  }
  catch (e) {
    console.log(e)
    return e;
  }
}

const claimReward = async (address, tokenId, character, nonce) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Quest = new ethers.Contract(config.QuestStake, Questabi, signer);
    const claimreward = await Quest.claimrewards(address, tokenId, character, false, nonce)
    console.log(claimreward)
  }
  catch (error) {
    console.log("error:", error);
    return error;
  }
}

const updatemodel = async (hash, transHash) => {
  console.log(hash, transHash, "===============upqueue")
  const findNonce = await Queue.findOne({ nonce: hash })
  findNonce.hash = transHash;
  findNonce.save()
}


const trainingStack = async (address, tokenId, character, identifier, hash) => {
  console.log(address, tokenId, character, identifier, "++++++++++++++++++++character,identifier")
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Training = new ethers.Contract(config.TrainingStake, Trainingabi, signer);
    const L1Nft = new ethers.Contract(config.L1NFT, L1NFTabi, signer);
    tokenId.map(async (id) => {
      const owner = await L1Nft.ownerof(id);
      console.log(owner, id, "++++++++++++++++++++++++++++++++++++finding owner")
    })
    const Nft = new ethers.Contract(config.NFT, NFTabi, signer);
    const approve = await Nft.batchapprove(config.TrainingStake, tokenId)
    await approve.wait();
    console.log(approve, "===========approved or not")
    const Trainingstack = await sendTxWithNonce(Training, "tokenstake", [address, tokenId, character, identifier])
    console.log(Trainingstack, "======stacke in Training")
    const getStackedTokens = await Training.getStakedTokens(address)
    console.log(getStackedTokens.toString(), "=============stacked token in quest");
    if (Trainingstack.hash) {
      const activityModel = new Activity({ publicKey: address, tokenId: tokenId, type: "Training", Message: `TokenId ${tokenId} Stacked in the Training Sucessfully` })
      await activityModel.save();
      await updatemodel(hash, Trainingstack.hash);
      return Trainingstack
    } else {
      console.log("something worng in the TrainingStack")
      return
    }
  }
  catch (err) {
    console.log("error:", err)
    return err
  }
}

const trainingUnstack = async (address, tokenId, character, identifier, hash) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Training = new ethers.Contract(config.TrainingStake, Trainingabi, signer);
    // const L1Nft = new ethers.Contract(config.L1NFT,L1NFTabi,signer);
    // tokenId.map(async (id) =>{
    //   const owner = await L1Nft.ownerof(id);
    //   console.log(owner,id,"++++++++++++++++++++++++++++++++++++finding owner")
    // })
    const Trainingstack = await sendTxWithNonce(Training, "tokenunstake", [address, tokenId, character, identifier])
    console.log(Trainingstack, "======stacke in Training")
    if (Trainingstack.hash) {
      const activityModel = new Activity({ publicKey: address, tokenId: tokenId, type: "Untraining", Message: `TokenId ${tokenId} Unstaked in the Training Sucessfully` })
      await activityModel.save();
      await updatemodel(hash, Trainingstack.hash);
      return Trainingstack
    } else {
      console.log("something worng in the TrainingUnstack")
      return
    }
  }
  catch (err) {
    console.log("error:", err)
    return err
  }
}

const currentReward = async (address) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Quest = new ethers.Contract(config.QuestStake, Questabi, signer);
    const claimedBalance = await Quest.claimedReward(address);
    console.log(claimedBalance, "==============claimed balance")
    return claimedBalance;
  }
  catch (err) {
    console.log("error:", err);
    return res.status(500).json({ status: false, error: err })
  }
}


const resetReward = async (address) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Quest = new ethers.Contract(config.QuestStake, Questabi, signer);
    const claimedBalance = await Quest.resetClaimReward(address);
    console.log(claimedBalance, "==============claimed balance")
    return claimedBalance;
  }
  catch (err) {
    console.log("error:", err);
    return err
  }
}

const depositeToken = async (address,reward,hash) => {
  try {
    console.log(address,reward,"==============rewarde")
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    const signer = new ethers.Wallet(config.Prv_key, provider);
    const Quest = new ethers.Contract(config.QuestStake, Questabi, signer);
    console.log(address, parseFloat(ethers.utils.formatEther(reward.toString())));
    const Token = parseFloat(ethers.utils.formatEther(reward.toString()));
    const depositeToken = await sendTxWithNonce(Quest, "depositeReward", [address, parseFloat(ethers.utils.formatEther(reward.toString()))])
    console.log(depositeToken, "======deposite token in L2")
    if (depositeToken.hash) {
      const activityModel = new Activity({ publicKey: address, type: "Deposite", Message: `Deposite ${Token}Horn in Vault Sucessfully` })
      await activityModel.save();
      await updatemodel(hash, depositeToken.hash);
      return depositeToken
    } else {
      console.log("something worng in the depositeToken")
      return
    }
  }
  catch (err) {
    console.log("error:", err)
    return err
  }
}

module.exports = {
  L2mint,
  questStack,
  questUnstack,
  claimReward,
  currentReward,
  trainingStack,
  trainingUnstack,
  resetReward,
  depositeToken
}

