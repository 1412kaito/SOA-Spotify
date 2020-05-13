const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const jwt = require("jsonwebtoken");

const userModel = require("../models/user");
const User = userModel;

const secretkey = process.env.SECRET_KEY;
const helper = require('../helpers');

// /api/song?country=/
router.get('/', async (req, res)=>{
    try {
        const spotify_token = await helper.getSpotifyToken();
        let response = await helper.myrequest({
            url: 'https://api.spotify.com/v1/browse/new-releases?limit=10',
            headers: {
                Authorization: 'Bearer '+spotify_token.access_token
            },
            method: 'GET'
        })      
        let my_body = JSON.parse(response.body);
        // console.log(response.body);
        let albums = my_body['albums']['items'];
        let url = my_body['albums']['href'];
        // console.log(albums);
        
        let temp = albums.map(element => {
            return element['id']
        })
        console.log('ini temp', temp.join(','));
        
        let response2 = await helper.myrequest({
            method:'get',
            headers: {
                Authorization: 'Bearer '+spotify_token.access_token
            },
            url: 'https://api.spotify.com/v1/albums/',
            qs: {
                'ids': temp.join(',')
            }
        })
        // console.log('response 2', response2);
        let obj = JSON.parse(response2.body)
        obj = obj['albums']
        console.log('>>>', obj[0].tracks.items);
        console.log(">>>>");
        let items = []
        
        for (let index = 0; index < obj.length; index++) {
            const current_track = obj[index];
            let temp = current_track['tracks']['items'].map(e => {
                return {
                    id: e['id'], title: e['name'],
                    uri: e['uri'], external: e['external_urls'],
                    details: e['href']
                }});
            items.push(...temp);
        }
        
        res.json(
            // spotify_url: url,
            items
        );
        // console.log('lewat')
    } catch (error) {
        console.error(error)
    }
    // res.send('/api/song/');
})


module.exports = router;