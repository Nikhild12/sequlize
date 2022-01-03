const express = require("express");
const mysql = require('mysql');
const router = express.Router();

const config = require("../config/config");

const mySqlConnConfig = {
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.db,
    handleDisconnects: true
}

var connection;

const handleDisconnect = () => {

    connection = mysql.createPool(mySqlConnConfig);

    connection.getConnection((err) => {
        if (err) {
            console.log('MYSQL CONNECTION ERROR', err.stack);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('MYSQL CONNECTION ESTABLISHED!');
        }
    });

    connection.on('error', (err) => {
        console.log('db error: ', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('MySql reconnection is initiated..');
            handleDisconnect();
        } else {
            console.log('Error in reconnection ', err);
        }
    });

    return {
        mySql_connection: connection
    }
}


module.exports = handleDisconnect();