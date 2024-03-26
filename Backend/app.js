
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const cron = require('node-cron');
require('dotenv/config');
const config=require('./config');
const stakingRoutes = require('./Router/staking');
const activityRoutes = require('./Router/activity')
const { stake } = require('./controller/userControl');
const path = require('path');
const{L1ContractConnection,L2ContractConnection}= require('./controller/streamController')
const {getPendingTranscation,pendingTxNonce} = require('./controller/queueController')
var cors = require('cors');

app.use(cors()) 
app.use(express.json());
app.use('/NFT', express.static(path.join(__dirname, 'NFT')));
app.use('/L2', stakingRoutes);
app.use('/activity',activityRoutes);

app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port} `)
});
mongoose.connect(config.db)
.then(() => {
    console.log("connected")
})
.catch((err) =>{
    console.log({error:err})
});

L1ContractConnection();
L2ContractConnection();
pendingTxNonce();

cron.schedule("*/10 * * * * *", () => {
    getPendingTranscation()
})
