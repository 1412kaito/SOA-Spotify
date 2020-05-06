const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const jwt = require("jsonwebtoken");

const userModel = require("../models/user");
const User = userModel;

const secretkey = process.env.SECRET_KEY;

router.get("/", async (req, res)=>{
    let resUser = await User.findAll();
    res.json(resUser);
    // res.send("ini user");
});

getUser= async(email_user, password_user=null)=>{
    let resUser = await User.findOne({
        where: {"email_user": email_user}
    })

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

    if(!email_user || !nama_user || !password_user) res.status(400).send("Data harus lengkap");
    else{
        let found = await getUser(email_user);
        if(found) res.status(200).send("Email sudah dipakai");
        else{
            try{
                let newUser = User.build({
                    email_user: email_user,
                    password_user: password_user,
                    nama_user: nama_user
                })
                newUser.save();
                res.status(200).send("Insert user baru berhasil");
            }catch(error){
                res.status(400).send(error);
            }
        }
    }
    
})

router.post('/login', async(req, res)=>{
    let email_user= req.body.email_user,
    password_user= req.body.password_user;
    if(!email_user || !password_user) res.status(400).send("Data harus lengkap");
    else{
        let found = await getUser(email_user, password_user);
        if(found) {
            let token = jwt.sign({
                email_user: email_user
            }, secretkey);
            res.status(200).send(token);
        }
        else{
            res.status(400).send("User tidak ditemukan");
        }
    }
})


module.exports=router;