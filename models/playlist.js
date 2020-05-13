const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

const Playlist = sequelize.define('Playlist', {
    email_user: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    nama_playlist: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi_playlist:{
        type: DataTypes.STRING,
        allowNull: true
    }
})

module.exports = Playlist;