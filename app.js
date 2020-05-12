const express = require('express');
const App = express();

App.use(express.urlencoded({extended: true}));
App.use(express.json());
App.use(express.static('./assets'))

module.exports = App;