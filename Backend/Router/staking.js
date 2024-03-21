const express = require('express');
// const { stake, unstake, getmintedtokens,getNFTtokenUri, gen0Signature, claimQuestReward} = require('../controller/userControl');
const userStaking = require('../controller/userControl')
const router = express.Router();
router.post('/stake', userStaking.stake);
router.post('/unstake', userStaking.unstake);
router.get('/mintedtokens/:address',userStaking.getmintedtokens);
router.get('/tokenuri/:tokenId',userStaking.getNFTtokenUri);
router.post('/gen0Signature',userStaking.gen0Signature);
router.post('/claimQuestReward',userStaking.claimQuestReward)
router.post('/trainingstack',userStaking.TrainingStack)
router.post('/trainingunstack',userStaking.TrainingUnstack)

module.exports = router;