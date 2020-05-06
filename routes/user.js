const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const jwt = require("jsonwebtoken");

const secretkey = process.env.SECRET_KEY;

router.get("/", (req, res)=>{
    res.send("ini user");
});

getUser= async(email_user, password_user=null)=>{
    let qry= `select * from users where email_user = '${email_user}'`;
    if(password_user)qry += ` and password_user ='${password_user}'`;

    let resUser = await sequelize.query(qry);
    console.log(resUser);
    if(resUser[0].length==0){
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
        console.log("found", found);
        if(found) res.status(200).send("Email sudah dipakai");
        else{
            try{
                let newUser = await sequelize.query(`insert into users (email_user, password_user, nama_user) values ('${email_user}','${password_user}','${nama_user}')`);
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