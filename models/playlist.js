const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

const Playlist = sequelize.define('Playlist', {
    email_user: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    nama_playlist: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi_playlist:{
        type: DataTypes.STRING,
        allowNull: true
    },
    jenis_playlist:{ 
        // 1 public, bisa diakses semua user, 
        // 0 private hanya bisa diakses user pembuat, fitur khusus member premium
        type:DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    jumlah_lagu: {
        type:DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
})

const User = require('./user');
User.hasMany(Playlist, {
    foreignKey: {
        name: 'email_user'
    },
})
Playlist.belongsTo(User, {
    // as: 'email_user',
    foreignKey: {
        name: 'email_user'
    }
})
module.exports = Playlist;