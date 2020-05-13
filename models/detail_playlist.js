const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');
const Playlist = require('./playlist');

const Detail = sequelize.define('Detail', {
    id_playlist:{
        type:DataTypes.INTEGER,
        primaryKey: true,
    },
    id_track: {
        type:DataTypes.STRING(22),
        primaryKey: true
    },
    urutan_dalam_playlist:{
        type:DataTypes.INTEGER,
        allowNull: true
    },
})


Playlist.hasMany(Detail, {
    foreignKey: 'id_playlist' 
})
Detail.belongsTo(Playlist, {
    foreignKey: 'id_playlist'
});
module.exports = Detail;