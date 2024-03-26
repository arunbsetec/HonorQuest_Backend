const express = require('express');
const router = express.Router();
const {vaultStack,vaultUnstack,getAllActivity,getIdActivity,claimReward} = require('../controller/ActivityController');
router.post('/vaultStack',vaultStack);
router.post('/vaultUnstack',vaultUnstack)
router.get('/getAll/:id',getAllActivity)
router.get('/getId/:id',getIdActivity)
router.post('/claimreward',claimReward)

module.exports = router;