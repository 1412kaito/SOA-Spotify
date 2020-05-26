const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Playlist = require("../models/playlist");
const Detail = require("../models/detail_playlist");

const sequelize = require('sequelize');
const operator = sequelize.Op; //untuk or, not dsb

const BATAS_PLAYLIST = 3;

router.post("/", async(req, res)=>{
    let token = req.header("x-auth-token");
    // if(!token) res.status(404).send("Token not found!");
    // else{
    try{
        let user = jwt.verify(token, process.env.SECRET_KEY);
        let nama_playlist= req.body.nama_playlist,
        deskripsi_playlist = req.body.deskripsi_playlist;

        if(!nama_playlist) {
            // res.status(400).send("Nama playlist wajib dicantumkan");
            res.status(400).json({
                status: 400,
                message: "Nama playlist wajib dicantumkan"
            })
        }
        else{
            //cari apakah dia premium atau bukan
            let resUser = await User.findOne({
                where: {"email_user": user.email_user}
            })
            if (!resUser) throw new Error('User tidak terdaftar dalam database');
            //cari jumlah playlist yg sudah dibuat
            let resPlaylist = await Playlist.findAll({
                where: {"email_user": user.email_user}
            });

            let exp= new Date(resUser.exp_premium);
            // console.log(resPlaylist.length);
            // console.log(exp);
            //kalau free user
            if(exp < new Date()  ){
                if(resPlaylist.length < BATAS_PLAYLIST ){ 
                    // console.log("masuk");
                    let newPlaylist = await Playlist.build({
                        email_user: user.email_user,
                        nama_playlist: nama_playlist,
                        deskripsi_playlist: deskripsi_playlist
                    })
                    await newPlaylist.save();
                    res.status(200).json({
                        status: 200,
                        message: `Berhasil add playlist ${nama_playlist}`,
                        playlist: newPlaylist
                    });
                } else{
                    res.status(400).json({
                        status: 400,
                        message: `Free user hanya dapat membuat playlist maksimal ${BATAS_PLAYLIST}`
                    });
                }
            // kalau premium bisa banyak
            } else{
                let newPlaylist = await Playlist.build({
                    email_user: user.email_user,
                    nama_playlist: nama_playlist,
                    deskripsi_playlist: deskripsi_playlist
                })
                let x = await newPlaylist.save();
                res.status(200).json({
                    status: 200, 
                    message: `Berhasil add playlist ${nama_playlist}`,
                    playlist: newPlaylist
                });
            }
            // console.log(resPlaylist.length);
        }
    }catch(err){
        console.error(err);
        res.status(400).json({status: 400, message: err.message});
    }
    // }
})

//get public playlist
router.get('/', async(req, res)=>{
    const token = req.headers['x-auth-token'];
    // console.log(token);
    let page = parseInt(req.query.page) - 1 || 0
    if (page < 0) page = 0;

    let t = await checkuser(token, async (user)=>{
        let x = await User.findOne({
            where:{
                email_user: user.email_user
            },
            attributes: ['email_user', 'nama_user', 'exp_premium']
        })
        // console.log(x.toJSON());
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
            nama: e.nama_playlist,
            creator: e.email_user,
            deskripsi: e.deskripsi_playlist,
            tipe: (e.jenis_playlist === 1)? 'public' : 'private',
            jumlah_lagu: e.jumlah_lagu
        }
    })
    res.json({status: 200, playlists});
})

router.post('/add',async (req,res)=>{
    const token = req.headers['x-auth-token'];
    // console.log(token);
    // if(!token) res.status(404).send("Token not found!");
    // else{
        try{
            let user = jwt.verify(token, process.env.SECRET_KEY);
            let id_playlist=req.body.id_playlist;
            if(!id_playlist) res.status(400).send("ID playlist wajib dicantumkan");
            else{
                //cari playlist dari user tersebut dan namanya sesuai
                let resPlaylist = await Playlist.findOne({
                    where: {"email_user": user.email_user,"id":id_playlist}
                });
                let lagu=req.body.lagu;
                if (resPlaylist){
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
                    resPlaylist.jumlah_lagu+=lagu.length;
                    await resPlaylist.save();
                    
                    res.status(200).send({
                            message: `Berhasil menambahkan lagu pada playlist ${resPlaylist.nama_playlist}`
                    });
                }
                else {
                    res.status(400).json({status: 400, message: "Anda tidak berhak mengubah playlist ini"});
                }
            }
        }catch(err){
            console.error(err);
            res.status(400).json({status: 400, message: err.message});
        }
    // }
});

router.put('/update',async(req,res)=>{
    const token = req.headers['x-auth-token'];
    // console.log(token);
    // if(!token) res.status(404).send("Token not found!");
    // else{
        try{
            let user = jwt.verify(token, process.env.SECRET_KEY);
            let id_playlist=req.body.id_playlist,
            deskripsi_playlist = req.body.deskripsi_playlist,jenis_playlist=req.body.jenis_playlist;
            if(!id_playlist) res.status(400).send({message:"ID Playlist wajib dicantumkan"});
            else if(!jenis_playlist)res.status(400).send({message:"Tipe Playlist Harap Dicantumkan"});
            else{
                let dataplaylist = await Playlist.findOne({
                    where: {"email_user": user.email_user,"id":id_playlist}
                })
                if(dataplaylist==null)res.status(400).send({message:"Playlist Tidak Ditemukan"});
                else{
                    dataplaylist.deskripsi_playlist=deskripsi_playlist;
                    dataplaylist.jenis_playlist=jenis_playlist;
                    await dataplaylist.save();
                    res.status(200).send({message:"Sukses Update Playlist"});
                }
             
            }
        }catch(err){
            console.error(err);
            res.status(400).json({status: 400, message: err.message});
        }
    // }
});

router.delete('/deleteSong',async(req,res)=>{
    const token = req.headers['x-auth-token'];
    // console.log(token);
    // if(!token) res.status(404).send("Token not found!");
    // else{
    try{
        let user = jwt.verify(token, process.env.SECRET_KEY);
        let id_playlist=req.body.id_playlist,
        id_lagu=req.body.id_lagu;
        if(!id_playlist) res.status(400).send({message:"ID Playlist wajib dicantumkan"});
        else{
            let dataplaylist = await Playlist.findOne({
                where: {"email_user": user.email_user,"id":id_playlist}
            })
            if(dataplaylist==null)res.status(400).send({message:"Playlist Tidak Ditemukan"});
            else{
                await Detail.destroy({where:{"id_track":id_lagu}});
                dataplaylist.jumlah_lagu--;
                await dataplaylist.save();
                res.status(200).send({message:"Lagu dengan id "+id_lagu+" berhasil dihapus"});
            }
        }
    }catch(err){
        console.error(err);
        res.status(400).json({status: 400, message: err.message});
    }
    // }
});
router.get("/getPlaylist",async(req,res)=>{
    const token = req.headers['x-auth-token'];
    // console.log(token);
    // if(!token) res.status(404).send("Token not found!");
    // else{
    try{
        let id_playlist=req.query.id_playlist;
        if(!id_playlist) res.status(400).send({message:"ID Playlist wajib dicantumkan"});
        else{
            let dataplaylist = await Playlist.findOne({
                where:{"id":id_playlist},
                attributes: ['id', 'email_user', 'nama_playlist', 'deskripsi_playlist', 'jenis_playlist', 'jumlah_lagu']
            })
            if(dataplaylist==null)res.status(400).send({message:"Playlist Tidak Ditemukan"});
            else{
                //jenis 1 = public
                if(dataplaylist.jenis_playlist==1){
                    let detail_lagu= await Detail.findAll({
                        where:{"id_playlist":id_playlist},order:['urutan_dalam_playlist'],
                        attributes:['id_track','urutan_dalam_playlist']
                    });
                    res.status(200).send({message:{dataplaylist,detail_lagu}});
                }else{
                    let user = jwt.verify(token, process.env.SECRET_KEY);
                    if(user.email_user==dataplaylist.email_user){
                        let detail_lagu= await Detail.findAll({
                            where:{"id_playlist":id_playlist},order:['urutan_dalam_playlist'],
                            attributes:['id_track','urutan_dalam_playlist']
                        });
                        res.status(200).send({message:{dataplaylist,detail_lagu}});
                    } else res.status(403).send({message:"Playlist ini bersifat private"});
                }
                
            }
        }
    }catch(err){
        console.error(err);
        res.status(400).json({status: 400, message: err.message});
    }
    // }
});
const checkuser = async(token, callback)=>{
    const SECRET = process.env.SECRET_KEY;
    try {
        let u = jwt.verify(token, SECRET);
        // console.log(u);
        return callback(u);
    } catch (error) {
        return {
            error: error,
            status: 401
        }
    }
}

module.exports= router;