const mysql = require('mysql2')
require('dotenv').config();

const myconnection = () =>{
   const connection =  mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'BECHDE'
    })

    connection.connect((err)=>{
        if(!err){
           return 
        }
        return console.log("Error in connection");
    })
    return connection;
}


module.exports = myconnection;

