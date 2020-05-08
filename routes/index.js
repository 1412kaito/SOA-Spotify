const express = require('express');
const router = express.Router();

router.use("/user",require("./user"));

//coba akses spotify api
// const axios = require('axios');
const request = require('request');

function myrequest(options){
    return new Promise((resolve, reject)=>{
        request(options, (err, response)=>{
            if (err) return reject (err)
            return resolve(response)
        })
    })
}

router.get('/', async(req, res)=>{
    let s = process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET;
    let b64 = Buffer.from(s).toString('base64');
    console.log(b64);
    
    var options = {
        'method': 'POST',
        'url': 'https://accounts.spotify.com/api/token',
        'headers': {
            'Authorization': `Basic ${b64}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
            'grant_type': 'client_credentials'
        }
    };
    
    try {
        let response = await myrequest(options);
        let isi_body = JSON.parse(response.body);
        let token = isi_body;
        res.json(isi_body);
    } catch (error) {
        res.json({
            message: "client id dan client secretnya pastiin sudah masuk",
            error});
    }
})

module.exports = router;