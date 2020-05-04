require('dotenv').config();
const express = require('express');
const App = require('./app.js');

const port = process.env.PORT;



App.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})