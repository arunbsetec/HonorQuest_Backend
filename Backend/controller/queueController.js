const Queue = require('../model/queuemodel')
const ethers = require('ethers');
const config = require('../config')
const { L2mint, questStack, questUnstack,trainingStack,resetReward, trainingUnstack,depositeToken } = require('../helper/eventhelper')

async function getPendingTranscation() {
  try {
    const getPendingTx = await Queue.find({ status: "pending" })
    await Promise.all(getPendingTx.map((queue) => {
      processTranscation(queue);
    }))

  }
  catch (e) {
    console.log("error:", e)
  }
}

async function processTranscation(queue) {
  console.log(queue, "==============queue")
  const trans = JSON.parse(queue.data);
  let pendingtransction = await pendingTxNonce()
  queue.nonce = pendingtransction + 1
  queue.status = "inprocess";
  await queue.save();
  console.log(queue, "==================total data");
  console.log("Transaction Data:", trans);
  if (trans.type == "Mint") {
    console.log("mint on L2 is called ===========================================", trans.to, trans.tokenIds, pendingtransction, queue.nonce)
    L2mint(trans.to, trans.tokenIds, pendingtransction, queue.nonce)
  }
  else if (trans.type == "Stake") {
    console.log("quest stack called ===============")
    questStack(trans.to, trans.tokenIds, trans.characters, pendingtransction, queue.nonce)
  }
  else if (trans.type == "Unstake") {
    console.log("quest unstack called ===============")
    questUnstack(trans.to, trans.tokenIds, trans.characters, pendingtransction, queue.nonce)
  }
  else if(trans.type == "trainingStake"){
    console.log("training stack called ===============")
    trainingStack(trans.to, trans.tokenIds, trans.characters, pendingtransction,queue.nonce)
  }
  else if(trans.type == "trainingUnstake"){
    console.log("Training Unstack called ===============")
    trainingUnstack(trans.to, trans.tokenIds, trans.characters, pendingtransction,queue.nonce)
  }
  else if(trans.type == "claimed"){
    console.log("claimed stack is called============")
    resetReward(trans.to);
  }
  else if(trans.type == "Transfer"){
    console.log("Horn is called===========")
    const token =await depositeToken(trans.from,trans.reward,queue.nonce)
    console.log(token,"===========token")
  }
}

async function pendingTxNonce() {

  const L2provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
  const nonce = await L2provider.getTransactionCount(config.Pub_key, "pending")
  console.log(nonce - 1, "=============nonce value")
  return nonce - 1 ;
}

module.exports = {
  getPendingTranscation,
  processTranscation,
  pendingTxNonce
}