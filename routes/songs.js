const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const jwt = require("jsonwebtoken");

const userModel = require("../models/user");
const User = userModel;

const secretkey = process.env.SECRET_KEY;
const helper = require('../helpers');

router.get('/', async (req, res)=>{
    let currentoffset = 0;
    let page = 1;
    const market = req.query.market;
    if (req.query.page && req.query.page < 6){
        currentoffset = req.query.page - 1;
        currentoffset *= 20;
        page = req.query.page;
        // currentoffset -= 1;
        if (currentoffset < 0) currentoffset = 0;
    }
    try {
        const spotify_token = await helper.getSpotifyToken();
        let response = await helper.myrequest({
            url: 'https://api.spotify.com/v1/browse/new-releases',
            headers: {
                Authorization: 'Bearer '+spotify_token.access_token
            },
            method: 'GET',
            qs: {
                limit: 20,
                offset: currentoffset,
                country: (market && market.length == 2) ? market : undefined
            }
        })      
        let my_body = JSON.parse(response.body);
        // console.log(my_body);
        
        let albums = my_body['albums']['items'];
        
        let temp = albums.map(element => {
            return element['id']
        })
        
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
        // console.log(obj);

        obj = obj['albums']
        let items = {}
        items['page'] = parseInt(page)
        items['data'] = []
        for (let index = 0; index < obj.length; index++) {
            const current_track = obj[index];
            let temp = current_track['tracks']['items'].map(e => {
                return {
                    id: e['id'], title: e['name'],
                    uri: e['uri'], external: e['external_urls'],
                    details: e['href']
                }});
            items['data'].push(...temp);
        }
        
        res.json(
            items
        );
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
});

// /api/song/query?keyword=asd&country=/
router.get('/query', async(req, res)=>{
    try {
        let currentoffset = req.query.offset || 0;
        let currentlimit = req.query.limit || 50;
        const spotify_token = await helper.getSpotifyToken();
        let hasil = await helper.myrequest({
            url: 'https://api.spotify.com/v1/search',
            headers: {
                Authorization: 'Bearer '+spotify_token.access_token
            },
            method: 'GET',
            qs: {
                type:'track',
                q: req.query.keyword,
                offset: currentoffset,
                limit: currentlimit
            }
        })
        // console.log(hasil);
        res.header('Content-Type', 'application/json')
        let kembalian_raw = JSON.parse(hasil.body);
        kembalian_spotify = kembalian_raw['tracks']['items'];
        console.log(kembalian_raw);
        
        const kembalianAkhir = {
            offset: kembalian_raw['tracks']['offset'],
            limit: kembalian_raw['tracks']['limit'],
            total: kembalian_raw['tracks']['total'], 
        }
        kembalianAkhir['data']= kembalian_spotify.map(element => {
            return {
                id: element['id'],
                title: element['name'],
                uri: element['uri'],
                external: element['external_urls'],
                details: element['href'],
            }
        });
        res.send(kembalianAkhir)
    } catch (error) {
        // console.error('error', error);
        res.status(500).json(error);
    }


    // res.send('masuk query');
});

router.get('/:id', async(req, res)=>{
    console.log('halo');
    try {
        const id = req.params.id;
        const token = await helper.getSpotifyToken();
        let hasil = await helper.myrequest({
            url: `https://api.spotify.com/v1/tracks/${id}`,
            headers: {
                Authorization: 'Bearer '+token.access_token
            },
            method: 'GET',
        })
        const track_object = JSON.parse(hasil.body)
        const song = {};
        
        song.details = {
            id: track_object.id,
            title:track_object.name, uri: track_object.uri, preview: track_object.preview_url,
            external_id: track_object.external_ids, external: track_object.external_urls
        }

        song.artists = []
        for (let index = 0; index < track_object['artists'].length; index++) {
            const element = track_object['artists'][index];
            song.artists.push({name: element.name, id: element.id, uri: element.uri, profile: element.external_urls})
        }

        res.json(song);
    } catch (error) {
        console.error("ERROR", error)
    }
    // res.json({id: req.params.id})
});

module.exports = router;