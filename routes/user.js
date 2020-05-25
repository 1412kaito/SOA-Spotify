const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const jwt = require("jsonwebtoken");

const userModel = require("../models/user");
const User = userModel;

const secretkey = process.env.SECRET_KEY;

router.get("/debug", async (req, res)=>{    
    if (process.env.DEBUG == 'true'){
        let resUser = await User.findAll();
        res.json(resUser);
    }
    else {

        res.status(404).json({});
    }
    // res.send("ini user");
});

getUser= async(email_user, password_user=null)=>{
    let resUser;
    if(password_user){
         resUser = await User.findOne({
            where: {"email_user": email_user, "password_user": password_user}
        })
    }else{
         resUser = await User.findOne({
            where: {"email_user": email_user}
        })
    }
   
    if(!resUser){
        return false
    }else{
        return true
    }
}

router.post("/register", async (req, res)=>{
    let email_user= req.body.email_user;
    let nama_user = req.body.nama_user;
    let password_user = req.body.password_user;

    if(!email_user || !nama_user || !password_user) {
        // res.status(400).send("Data harus lengkap");
        res.status(400).json({
            status: 400,
            message: "Data harus lengkap"
        })
    }
    else{
        let found = await getUser(email_user);
        if(found) {
            // res.status(200).send("Email sudah dipakai");
            res.status(400).json({
                status: 400,
                message: "Email sudah terdaftar dalam database"
            })
        }
        else{
            try{
                let newUser = User.build({
                    email_user: email_user,
                    password_user: password_user,
                    nama_user: nama_user
                })
                let x = await newUser.save();
                // console.log(x);
                // res.status(200).send("Insert user baru berhasil");
                res.status(200).json({
                    status: 200,
                    message: 'Registrasi berhasil'
                })
            }catch(error){
                console.error(error);
                res.status(500).json({
                    status: 500,
                    message: error.message
                });
                // res.status(400).send(error);
            }
        }
    }
})

router.post('/login', async(req, res)=>{
    let email_user= req.body.email_user,
    password_user= req.body.password_user;
    if(!email_user || !password_user) {
        // res.status(400).send("Data harus lengkap");
        res.status(400).json({
            status: 400,
            message: "Data harus lengkap"
        });
    }
    else{
        let found = await getUser(email_user, password_user);
        if(found) {
            //tambah kapan token tsb expired
            let token = jwt.sign({
                email_user: email_user
            }, secretkey, {
                expiresIn: '1d'
            });
            // res.status(200).send(token);
            res.status(200).json({
                status: 200,
                token: token,
            });
            //contoh verification jwt
            //try catch utk ndapetin token error / null / expired
            // try {
            //     let verified = jwt.verify(token, secretkey)
            //     console.log(verified);
            // } catch (error) {
            //     console.error(error)
            // }
        }
        else{
            // res.status(400).send("User tidak ditemukan");
            res.status(400).json({
                status: 400,
                message: "User tidak ditemukan"
            });
        }
    }
})

router.post("/getPremium", async(req, res)=>{
    let token = req.header("x-auth-token");
    let jumlah_bulan = parseInt(req.body.jumlah_bulan);

    // if(!token) res.status(404).send("Token not found!");
    // else{
    try{
        let user = jwt.verify(token, secretkey);
        let UserData = await User.findOne({
            where: {"email_user": user.email_user}
        })

        if(!jumlah_bulan) {
            // res.status(400).send("Data harus lengkap");
            res.status(400).json({
                status: 400,
                message: "Data tidak lengkap"
            });
        }
        else{
            // dicek apakah sudah pernah get premium blm atau sudah exp
            if(!UserData.exp_premium ||  new Date(UserData.exp_premium)< new Date()){
                let date = new Date();
                console.log(date);
                let new_exp_premium = date.setMonth(date.getMonth()+jumlah_bulan);
                UserData.exp_premium = new_exp_premium;
                try{
                    await UserData.save();
                    // res.status(200).send("Berhasil Get Premium");
                    res.status(200).json({
                        status: 200,
                        message: 'Berhasil daftar premium',
                        user: await User.findOne({
                            where: {
                                email_user: user.email_user
                            },
                            attributes: ['email_user', 'nama_user', 'exp_premium']
                        })
                    })
                }catch(error){
                    res.status(400).send(error);
                    res.status(400).json({
                        status: 400,
                        message: error.message
                    });
                }
            }else if(new Date(UserData.exp_premium)> new Date()){
                let exp_premium = new Date(UserData.exp_premium);

                UserData.exp_premium = exp_premium.setMonth(exp_premium.getMonth() + jumlah_bulan);
                await UserData.save();

                res.status(200).json({
                    status: 200,
                    message: 'Berhasil perpanjang langganan',
                    user: await User.findOne({
                        where: {
                            email_user: user.email_user
                        },
                        attributes: ['email_user', 'nama_user', 'exp_premium']
                    })
                })
                // res.status(400).json({
                //     status: 400,
                //     message: "Anda sudah berlangganan premium hingga " +  exp_premium.getDate().toString().padStart(2,0) + "/"+ (exp_premium.getMonth()+1).toString().padStart(2,0) + "/"+ exp_premium.getFullYear().toString(),
                //     user: await User.findOne({
                //         where: {
                //             email_user: user.email_user
                //         },
                //         attributes: ['email_user', 'nama_user', 'exp_premium']
                //     })
                // })
                // res.status(400).send({
                //     message: "Anda sudah berlangganan premium hingga " +  exp_premium.getDate().toString().padStart(2,0) + "/"+ (exp_premium.getMonth()+1).toString().padStart(2,0) + "/"+ exp_premium.getFullYear().toString()
                // })
            }
        }
    }catch(error){
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
        
    // }
})

router.put("/", async(req, res)=>{
    let token = req.header("x-auth-token");
    // if(!token) res.status(404).send("Token not found!");
    // else{
    try{
        let user = jwt.verify(token, secretkey);
        password_user= req.body.password_user,
        nama_user= req.body.nama_user;
        
        let UserData = await User.findOne({
            where: {"email_user": user.email_user}
        });
        if(password_user) UserData.password_user=password_user;
        if(nama_user) UserData.nama_user=nama_user;
        if(!password_user && !nama_user) {
            res.status(400).json({status: 400, message: "Tidak ada data yang diupdate"});
            return
        }
        await UserData.save();
        res.status(200).json({
            status: 200,
            message: "Berhasil update user",
            user: await User.findOne({
                where: {email_user : user.email_user},
                attributes: ['email_user', 'nama_user', 'exp_premium']
            })
        })
    } catch(err){
        // res.status(400).send(err);
        res.status(400).json({
            status: 400,
            message: err.message
        })
    }
    // }
})

router.get('/', async (req, res)=>{
    const token = req.headers['x-auth-token'];
    try {
        let user = jwt.verify(token, secretkey);
        const myuser = await User.findOne({
            where: {email_user: user.email_user},
            attributes: [
                'email_user', 'nama_user', 'exp_premium'
            ]
        })

        const Playlist = require('../models/playlist');
        const myplaylist = await Playlist.findAll({
            where: {'email_user': user.email_user}
        })

        const kembalian = {
            user: myuser,
            playlist: myplaylist
        }
        res.json({
            status: 200,
            ...kembalian
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: 400, message: error.message
        });
    }
})



module.exports=router;