const ethers = require('ethers');
const gen0abi = require("../abi/L1/Gen0.json");
const gen1abi = require("../abi/L1/Gen1.json");
const NFTabi = require('../abi/L2/nft.json');
const Queue = require('../model/queuemodel')
require("dotenv").config()
const config = require('../config')
const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 7500;
const WebSocket = require('ws');
const ws = require('ws');



// ---------------------------L1 contract ------------------------------

let provider = null;

// const startKeepAlive = (provider) => {
//   let pingTimeout = null;
//   let keepAliveInterval = null;

//   keepAliveInterval = setInterval(() => {
//     // console.log('Checking if the connection is alive');
//     if (provider._websocket.readyState === ws.OPEN) {
//       // console.log('Sending a ping');
//       provider._websocket.ping();
//       pingTimeout = setTimeout(() => {
//         provider._websocket.terminate();
//       }, EXPECTED_PONG_BACK);
//     } else {
//       console.log('WebSocket connection is not open');
//     }
//   }, KEEP_ALIVE_CHECK_INTERVAL);

//   provider._websocket.on('close', () => {
//     clearInterval(keepAliveInterval);
//     clearTimeout(pingTimeout);
//     console.log('WebSocket connection closed, trying to reconnect...');
//     if (provider === l1Provider) {
//       L1ContractConnection();
//     } else if (provider === l2Provider) {
//       L2ContractConnection();
//     }
//   });

//   provider._websocket.on('pong', () => {
//     clearInterval(pingTimeout);
//   });
// };

const L1ContractConnection = () => {
  provider = new ethers.providers.WebSocketProvider(config.socketUrl);
  console.log("alive================alive ===================alive=====1111")
  provider.websocket.on('open', () => {
    // startKeepAlive(provider);
    const contract = new ethers.Contract(config.Gen0, gen0abi, provider);
    contract.on("*", async (event) => {
      if (event.event === "Mint") {
        const transactionHash = event.transactionHash;
        const to = event.args[0];
        const quantity = Number(event.args[1].toString());
        let supply = Number(event.args[2].toString());
        let tokenId = [];
        for (let i = 0; i < quantity; i++) {
          console.log(supply,"=====supply")
          supply = supply + 1;
          console.log(supply + 1,"====================================+1")
          tokenId.push(supply - 1);
          console.log(tokenId,"===========tokenids")
        }
        let params = {
          to: to,
          type: event.event,
          tokenIds: tokenId
        };
        await sendqueue(params, transactionHash);
      } else if (event.event === "Price") {
        const price = event.args.toString();
        const transactionHash = event.transactionHash;
        let params = {
          type: event.event
        };
        // await send(params,transactionHash)
      }
    });
  });

  provider._websocket.on('close', () => {
    console.log('WebSocket connection closed, trying to reconnect...1111');
    L1ContractConnection();
  });
};

const L1Gen1ContractConnection = () => {
  provider = new ethers.providers.WebSocketProvider(config.socketUrl);
  console.log("alive================alive ===================alive=====1111")
  provider.websocket.on('open', () => {
    // startKeepAlive(provider);
    const contract = new ethers.Contract(config.Gen1, gen1abi, provider);
    contract.on("*", async (event) => {
      console.log(event,"===============event in the L1Gen1")
      if (event.event === "Mint") {
        const transactionHash = event.transactionHash;
        const to = event.args[0];
        const quantity = Number(event.args[1].toString());
        let supply = Number(event.args[2].toString());
        let tokenId = [];
        for (let i = 0; i < quantity; i++) {
          console.log(supply,"=====supply")
          supply = supply + 1;
          console.log(supply + 1,"====================================+1")
          tokenId.push(supply - 1);
          console.log(tokenId,"===========tokenids")
        }
        let params = {
          to: to,
          type: event.event,
          tokenIds: tokenId
        };
        await sendqueue(params, transactionHash);
      } else if (event.event === "Price") {
        const price = event.args.toString();
        const transactionHash = event.transactionHash;
        let params = {
          type: event.event
        };
        // await send(params,transactionHash)
      }
    });
  });

  provider._websocket.on('close', () => {
    console.log('WebSocket connection closed, trying to reconnect...1111');
    L1Gen1ContractConnection();
  });
};

const L2ContractConnection = () => {
  provider = new ethers.providers.WebSocketProvider(config.socketUrl);
  console.log("alive================alive ===================alive=====22222")
  provider.websocket.on('open', () => {
    console.log("=================================came in L2 ")
    // startKeepAlive(provider);
    const contract = new ethers.Contract(config.NFT, NFTabi, provider);
    // console.log(contract,"====================l2 instace")
    contract.on("*", async (event) => {
      console.log(event,"============event ================================================================")
      if (event.event === "L2Mint") {
        const transactionHash = event.transactionHash;
        const to = event.args[0];
        const tokenID = ((event.args[1]).map((token) => { return token.toNumber()}));
        const identifier = Number(event.args[2].toString());
        console.log("event_hash", transactionHash);
        console.log("Minted To:", to);
        console.log("TokenId:", tokenID);
        console.log("identifier:", identifier);
      }
    });
  });

  provider._websocket.on('close', () => {
    console.log('WebSocket connection closed, trying to reconnect...22222');
    L2ContractConnection();
  });
};

async function sendqueue(params, transactionHash) {
    try {
        console.log("params:", params);

        const existingTransaction = await Queue.findOne({ event_hash: transactionHash });
        const content = JSON.stringify(params);
        if (!existingTransaction) {
            const data = new Queue({ data:content,type: params.type,publickey:params.to, event_hash: transactionHash, status: "pending" });
            await data.save();
            console.log(data, "=======stored in db");
        } else {
            console.log(existingTransaction,"===================++++")
            console.log("Transaction already exists in the database");
        }
    } catch (e) {
        console.error("Error saving to the database:", e);
    }
}



module.exports={
  L1ContractConnection,
  L2ContractConnection,
  L1Gen1ContractConnection,
}
