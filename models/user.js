const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    email_user: {
        type: DataTypes.STRING,
        // allowNull: false,
        primaryKey: true
    },
    password_user: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama_user:{
        type: DataTypes.STRING,
        allowNull: false
    },
    exp_premium:{
        type: DataTypes.DATE,
        allowNull: true
    },
    image_path: {
        type: DataTypes.STRING,
        allowNull: true
    }
})


module.exports = User;