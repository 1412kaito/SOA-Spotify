require('dotenv').config();
const database = require('./database')
const express = require('express');
const App = require('./app.js');
const router = require('./routes/index');
const morgan = require('morgan');
const port = process.env.PORT;
//modelnya perlu dipanggil supaya tabel ke create
const History = require('./models/history');
const User = require('./models/user');
const Playlist = require('./models/playlist');
const Detail = require('./models/detail_playlist');


App.use(morgan('dev'));
App.use( async (req, res, next)=>{
    //ambil detail user disini
    //apa bisa ya dicek dia mengakses lagu atau playlist apa
    /*
    asdsa
    */
    let a = await History.build({
        activity: req.url
//      , id_user:id_user
    })
    a.save();
    next();
})
App.use('/api', router);
const path = require('path');
App.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//error handling
App.use((error, request, response, next)=>{
    // console.error('error', error)
    const multer = require('multer');
    const jwt = require('jsonwebtoken');
    if (error instanceof multer.MulterError){
        response.status(400).json({
            status: 400, 
            message: error.message
        })
    }
    else if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError){
        response.status(400).json({
            status: 400,
            message: error.message
        })
    }
    else {
        response.status(500).json({
            status:500,
            message: error.message
        })
    }
});

App.listen(port, async ()=>{
    const fs = require('fs');
    const path = require('path');
    try {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
        console.log("Created upload dir");
    } catch (error) {
        if (error.code === 'EEXIST') {}
        else console.error(error);        
    }
    
    database.sync({force: true});
    console.log('Reset database');
    
    console.log(`Listening on port ${port}`);
     //let t = await User.sync({alter: true});
    //database.sync supaya seluruh model yang pernah terpanggil ke create table
    //alter: tabel di update
    // database.sync({alter: true});

    //force: tabel di drop dan di create ulang
    // database.sync({force: true});
     // console.log(`hasil user sync ${t}`);
})
