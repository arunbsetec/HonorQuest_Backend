const ethers =require('ethers')
const config = require('../config')
const Gen0ABI = require('../abi/L1/Gen0.json')

async function sendTxWithNonce(contractObj, funcName, args, pending) {
    try {
      const gasLimit = "8000000";
      const gasPrice = "200000000000";      
      let result = await contractObj[funcName](...args, { nonce: pending,gasLimit:gasLimit });
      // await result.wait();
      console.log(result,"=====================================================================result");
      return result;
    } catch (e) {
      console.log(e)
      return e;
    }
  }

async function gen0Signature(address,quantity){ 
  const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
  const signer = new ethers.Wallet(config.Prv_key, provider);
  const Instance = new ethers.Contract(config.Gen0,Gen0ABI, signer);
  const Gen0 = config.Gen0
    {
      const domain ={
        name: "Gen0Mint",
        version: '1',
        chainId: '11155111',
        verifyingContract:Gen0
      }
      
      const types = {
        GenoMint:[
          { name: 'wallet', type: 'address' },
          { name: 'count', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      }
    
      const value = {
        wallet: address,
        count: quantity,
        deadline: Date.now() + 10000
      };
      console.log(address,quantity,"==============utils")
      const signature = await signer._signTypedData(domain,types,value)
      console.log(signature,"====signature")
      const {v,r,s} =  ethers.utils.splitSignature(signature)
      console.log({v:v,r:r,s:s},"=========split signature")
      const nonce = await Instance.getNonce(address);
      console.log(nonce);
      const result = {
        v:v,
        r:r,
        s:s,
        deadline : value.deadline,
        nonce: nonce.toString()
      }
      console.log(result,"========result")
      return result;
    }

}






  module.exports = {
    sendTxWithNonce,
    gen0Signature
  }