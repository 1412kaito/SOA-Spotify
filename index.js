require('dotenv').config();
const database = require('./database')
const express = require('express');
const App = require('./app.js');

const port = process.env.PORT;
//modelnya perlu dipanggil supaya tabel ke create
const History = require('./models/history');
const User = require('./models/user');

App.listen(port, async ()=>{
    console.log(`Listening on port ${port}`);
    // let t = await User.sync({alter: true});
    //database.sync supaya seluruh model yang pernah terpanggil ke create table
    database.sync({alter: true});

    // console.log(`hasil user sync ${t}`);
})