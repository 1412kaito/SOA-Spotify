const express = require('express');
const App = express();
const router = require('./routes/index');
const morgan = require('morgan');

App.use(express.urlencoded({extended: true}));
App.use(express.json());

App.use(express.static('./assets'))

App.use('/api', router);
App.use(morgan('dev'));
module.exports = App;