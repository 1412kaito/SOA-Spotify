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

router.post("/getPremium", async(req, res)=>{
    let token = req.header("x-auth-token");
    let jumlah_bulan = parseInt(req.body.jumlah_bulan);

    if(!token) res.status(404).send("Token not found!");
    else{
        try{
            let user = jwt.verify(token, secretkey);
            let UserData = await User.findOne({
                where: {"email_user": user.email_user}
            })

            if(!jumlah_bulan) res.status(400).send("Data harus lengkap");
            else{
                 // dicek apakah sudah pernah get premium blm atau sudah exp
                if(!UserData.exp_premium ||  new Date(UserData.exp_premium)< new Date()){
                    let date = new Date();
                    console.log(date);
                    let new_exp_premium = date.setMonth(date.getMonth()+jumlah_bulan);
                    UserData.exp_premium= new_exp_premium;
                    
                    try{
                        UserData.save();
                        res.status(200).send("Berhasil Get Premium");
                    }catch(error){
                        res.status(400).send(error);
                    }
                }else if(new Date(UserData.exp_premium)> new Date()){
                    let exp_premium = new Date(UserData.exp_premium);
                    res.status(400).send({
                        message: "Anda sudah berlangganan premium hingga " +  exp_premium.getDate().toString().padStart(2,0) + "/"+ (exp_premium.getMonth()+1).toString().padStart(2,0) + "/"+ exp_premium.getFullYear().toString()
                    })
                }
            }
           
            
        }catch(error){
            res.status(400).send(error);
        }
        
    }
})

module.exports=router;