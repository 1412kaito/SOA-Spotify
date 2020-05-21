const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Playlist = require("../models/playlist");
const Detail = require("../models/detail_playlist");

const sequelize = require('sequelize');
const operator = sequelize.Op; //untuk or, not dsb

router.post("/", async(req, res)=>{
    let token = req.header("x-auth-token");
    if(!token) res.status(404).send("Token not found!");
    else{
        try{
            let user = jwt.verify(token, process.env.SECRET_KEY);
            let nama_playlist= req.body.nama_playlist,
            deskripsi_playlist = req.body.deskripsi_playlist;

            if(!nama_playlist) res.status(400).send("Nama playlist wajib dicantumkan");
            else{
                //cari apakah dia premium atau bukan
                let resUser = await User.findOne({
                    where: {"email_user": user.email_user}
                })

                //cari jumlah playlist yg sudah dibuat
                let resPlaylist = await Playlist.findAll({
                    where: {"email_user": user.email_user}
                });

                let exp= new Date(resUser.exp_premium);
                console.log(resPlaylist.length);
                console.log(exp);
                //kalau free user
                if(exp < new Date()  ){
                    if(resPlaylist.length<3 ){ 
                        console.log("masuk");
                        let newPlaylist = Playlist.build({
                            email_user: user.email_user,
                            nama_playlist: nama_playlist,
                            deskripsi_playlist: deskripsi_playlist
                        })
                        await newPlaylist.save();
                        res.status(200).send({
                            message: `Berhasil add playlist ${nama_playlist}`
                        });
                    }else{
                        res.status(400).send("Free user hanya dapat membuat playlist maximal 3");
                    }
                // kalau premium bisa banyak
                }else{
                    let newPlaylist = Playlist.build({
                        email_user: user.email_user,
                        nama_playlist: nama_playlist,
                        deskripsi_playlist: deskripsi_playlist
                    })
                    let x = await newPlaylist.save();
                    res.status(200).send({
                        message: `Berhasil add playlist ${nama_playlist}`
                    });
                }
                console.log(resPlaylist.length);
                
            }
            
        }catch(err){
            res.status(400).send(err);
        }
    }
})

//get public playlist

router.get('/', async(req, res)=>{
    const token = req.headers['x-auth-token'];
    console.log(token);
    let page = parseInt(req.query.page) - 1 || 0
    if (page < 0) page = 0;

    let t = await checkuser(token, async (user)=>{
        let x = await User.findOne({
            where:{
                email_user: user.email_user
            },
            attributes: ['email_user', 'nama_user', 'exp_premium']
        })
        console.log(x.toJSON());
        return x;
    })
    let email_user = ''
    if (t.email_user){
        email_user = t.email_user
    }
    let playlists = await Playlist.findAll({
        where: {
            [operator.or]: [
                {'jenis_playlist':1},
                {email_user: email_user}
            ]
        },
        limit: 10,
        offset: page*10,
        attributes: ['id', 'email_user', 'nama_playlist', 'deskripsi_playlist', 'jenis_playlist', 'jumlah_lagu']
    })

    playlists = playlists.map(e => {
        return {
            id_playlist: e.id,
            creator: e.email_user,
            deskripsi: e.deskripsi_playlist,
            tipe: (e.jenis_playlist === 1)? 'public' : 'private',
            jumlah_lagu: e.jumlah_lagu
        }
    })
    res.json(playlists);
})

router.post('/add',async (req,res)=>{
    const token = req.headers['x-auth-token'];
    console.log(token);
    if(!token) res.status(404).send("Token not found!");
    else{
        try{
            let user = jwt.verify(token, process.env.SECRET_KEY);
            let nama_playlist=req.body.nama_playlist;
            if(!nama_playlist) res.status(400).send("Nama playlist wajib dicantumkan");
            else{
                //cari playlist dari user tersebut dan namanya sesuai
                let resPlaylist = await Playlist.findAll({
                    where: {"email_user": user.email_user,"nama_playlist":nama_playlist}
                });
                let id_playlist=resPlaylist[0].dataValues.id;
                let lagu=req.body.lagu;
                
                for(let i=0;i<lagu.length;i++) {
                    let counter= await Detail.count({
                        where: {id_playlist: id_playlist}
                    });
                    let detailPlaylist = await Detail.build({
                        id_playlist:id_playlist,
                        id_track: lagu[i],
                        urutan_dalam_playlist:counter+1
                    });
                    let x = await detailPlaylist.save();         
                }
               
                res.status(200).send({
                        message: `Berhasil menambahkan lagu pada playlist ${nama_playlist}`
                });
            }
        }catch(err){
            res.status(400).send(err);
        }
    }
});




const checkuser = async(token, callback)=>{
    const SECRET = process.env.SECRET_KEY;
    try {
        let u = jwt.verify(token, SECRET);
        console.log(u);
        return callback(u);
    } catch (error) {
        return {
            error: error,
            status: 401
        }
    }
}

module.exports= router;