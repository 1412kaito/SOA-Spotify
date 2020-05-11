const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

const History = sequelize.define('History', {
    id_history:{
        type: DataTypes.UUID, default:DataTypes.UUIDV1,
        primaryKey: true,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activity: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    song_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    playlist_id: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})

module.exports = History