require('dotenv/config')
exports.port=process.env.port
exports.db=process.env.Data
exports.socketUrl=process.env.ETH_NODE_WSS
exports.RPC_URL=process.env.RPC_URL
exports.Mumbai_RPC_URL=process.env.Mumbai_RPC_URL
exports.Pub_key=process.env.admin_PublicKey
exports.Prv_key=process.env.admin_PrivateKey
exports.Gen0=process.env.L1Gen0Contract_Address
exports.Gen1=process.env.L1Gen1Contract_Address
exports.Horn=process.env.L1HornContract_Address
exports.NFT=process.env.L2NFTContract_Address
exports.QuestStake=process.env.L2QuestContract_Address
exports.TrainingStake=process.env.L2TrainingContract_Address
exports.L1NFT=process.env.L1NFTContract_Address
exports.L1Vault=process.env.L1VaultContract_Address
exports.L1Registry=process.env.L1Registry_Address
exports.L2Registry=process.env.L2Registry_Address