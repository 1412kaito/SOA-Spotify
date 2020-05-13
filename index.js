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

    let a = await History.build({
        activity: req.url
//      , id_user:id_user
    })
    a.save();
    
    next();

})
App.use('/api', router);

App.listen(port, async ()=>{
    console.log(`Listening on port ${port}`);
    // let t = await User.sync({alter: true});
    //database.sync supaya seluruh model yang pernah terpanggil ke create table
    //alter: tabel di update
    // database.sync({alter: true});

    //force: tabel di drop dan di create ulang
    database.sync({force: true});

    // console.log(`hasil user sync ${t}`);
})
