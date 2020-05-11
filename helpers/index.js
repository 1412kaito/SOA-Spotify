const request = require('request');

function myrequest(options){
    return new Promise((resolve, reject)=>{
        request(options, (err, response)=>{
            if (err) return reject (err)
            return resolve(response)
        })
    })
}

async function getSpotifyToken() {
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
        return token;
    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {
    myrequest, getSpotifyToken
}