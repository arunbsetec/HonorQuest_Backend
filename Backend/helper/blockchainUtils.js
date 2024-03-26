const ethers = require('ethers')
const config = require('../config')
const Gen0ABI = require('../abi/L1/Gen0.json')
const Gen1ABI = require('../abi/L1/Gen1.json')
const ClaimABI = require('../abi/L1/Claim.json')

async function sendTxWithNonce(contractObj, funcName, args, pending) {
  try {
    const gasLimit = "8000000";
    const gasPrice = "200000000000";
    let result = await contractObj[funcName](...args, { nonce: pending, gasLimit: gasLimit });
    // await result.wait();
    console.log(result, "=====================================================================result");
    return result;
  } catch (e) {
    console.log(e)
    return e;
  }
}

async function gen0Signature(address, quantity) {
  const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
  const signer = new ethers.Wallet(config.Prv_key, provider);
  const Instance = new ethers.Contract(config.Gen0, Gen0ABI, signer);
  const Gen0 = config.Gen0
  {
    const domain = {
      name: "Gen0Mint",
      version: '1',
      chainId: '11155111',
      verifyingContract: Gen0
    }

    const types = {
      GenoMint: [
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
    console.log(address, quantity, "==============utils")
    const signature = await signer._signTypedData(domain, types, value)
    console.log(signature, "====signature")
    const { v, r, s } = ethers.utils.splitSignature(signature)
    console.log({ v: v, r: r, s: s }, "=========split signature")
    const nonce = await Instance.getNonce(address);
    console.log(nonce);
    const result = {
      v: v,
      r: r,
      s: s,
      deadline: value.deadline,
      nonce: nonce.toString()
    }
    console.log(result, "========result")
    return result;
  }

}

async function gen1Signature(address, quantity) {
  const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
  const signer = new ethers.Wallet(config.Prv_key, provider);
  const Instance = new ethers.Contract(config.Gen1, Gen1ABI, signer);
  const Gen1 = config.Gen1
  {
    const domain = {
      name: "Gen0Mint",
      version: '1',
      chainId: '11155111',
      verifyingContract: Gen1
    }

    const types = {
      GenoMint: [
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
    console.log(address, quantity, "==============utils")
    const signature = await signer._signTypedData(domain, types, value)
    console.log(signature, "====signature")
    const { v, r, s } = ethers.utils.splitSignature(signature)
    console.log({ v: v, r: r, s: s }, "=========split signature")
    const nonce = await Instance.getNonce(address);
    console.log(nonce);
    const result = {
      v: v,
      r: r,
      s: s,
      deadline: value.deadline,
      nonce: nonce.toString()
    }
    console.log(result, "========result")
    return result;
  }

}

async function claimSignature(address,reward) {
  console.log(address,reward,"==============claim parametes")
  const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
  const signer = new ethers.Wallet(config.Prv_key, provider);
  const Instance = new ethers.Contract(config.L1Claim, ClaimABI, signer);
  const Claim = config.L1Claim

  let types = {
    ClaimReward: [
      { name: 'wallet', type: 'address' },
      { name: 'reward', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  let domain = {
    name: 'ClaimReward',
    version: '1',
    chainId: '11155111',
    verifyingContract: Claim,
  };

  let message = {
    wallet: address,
    reward: ethers.utils.parseEther((reward).toString()),
    deadline: Date.now() + 1000,
  };
  console.log(types,domain,message,"=====================sign datea")
  const signature = await signer._signTypedData(domain, types, message)
  console.log(signature, "====signature")
  const { v, r, s } = ethers.utils.splitSignature(signature)
  console.log({ v: v, r: r, s: s }, "=========split signature")
  const nonce = await Instance.getNonce(address);
  console.log(nonce);
  const result = {
    v: v,
    r: r,
    s: s,
    deadline: message.deadline,
    nonce: nonce.toString()
  }
  console.log(result, "========result")
  return result;
}

// async function claimSignature(address, reward) {
//   const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
//   const signer = new ethers.Wallet(config.Prv_key, provider);
//   const Instance = new ethers.Contract(config.L1Claim, ClaimABI, signer);
//   const Claim = config.L1Claim;

//   let types = {
//     ClaimReward: [
//       { name: 'wallet', type: 'address' },
//       { name: 'reward', type: 'uint256' },
//       { name: 'deadline', type: 'uint256' },
//     ],
//   };

//   let domain = {
//     name: 'ClaimReward',
//     version: '1',
//     chainId: '11155111',
//     verifyingContract: Claim,
//   };

//   let message = {
//     wallet: address,
//     reward: ethers.utils.parseUnits(reward.toString(), 'ether'), // Convert reward to ethers BigNumber
//     deadline: Date.now() + 1000,
//   };

//   console.log('Message:', message);

//   try {
//     const signature = await signer._signTypedData(domain, types, message);
//     console.log('Signature:', signature);

//     const { v, r, s } = ethers.utils.splitSignature(signature);
//     console.log('v:', v, 'r:', r, 's:', s);

//     const nonce = await Instance.getNonce(address);
//     console.log('Nonce:', nonce);

//     const result = {
//       v: v,
//       r: r,
//       s: s,
//       deadline: message.deadline,
//       nonce: nonce.toString(),
//     };

//     console.log('Result:', result);

//     return result;
//   } catch (error) {
//     console.error('Error:', error);
//     throw error;
//   }
// }



module.exports = {
  sendTxWithNonce,
  gen0Signature,
  gen1Signature,
  claimSignature
}