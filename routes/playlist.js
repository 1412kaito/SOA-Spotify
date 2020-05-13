const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const jwt = require("jsonwebtoken");

const userModel = require("../models/user");
const User = userModel;
const playlistModel = require("../models/playlist");
const Playlist = playlistModel;

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

    


module.exports= router;