const express = require('express');
const router = express.Router();

router.use("/user", require("./user"));
router.use('/songs', require('./songs'));
router.use('/playlist', require('./playlist'));

//coba akses spotify api
const axios = require('axios');
const request = require('request');

const getSpotifyToken = require('../helpers').getSpotifyToken

router.get('/', async(req, res)=>{
    res.send(await getSpotifyToken())
    // res.send("Sukses masuk api!");
})

module.exports = router;