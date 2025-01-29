const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const shortUniquId = require('short-unique-id')
const uuid = new shortUniquId({lenght: 10})
require('../db/conn');
const mysqli = require('../db/conn');
const dataConnection = mysqli();
const promiseConn = dataConnection.promise();
const jwt = require('jsonwebtoken');

router.post('/new',async(req,res)=>{
try{
    const userId = uuid.rnd();
    const createdAt = new Date();
    const {firstName,lastName,address, phone, pincode,username, password} = req.body;

    //exisitng user check
    const [existingUser] = await promiseConn.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
        return res.status(409).send("Username already exists");
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const addQuery = "INSERT INTO users(userId, firstName, lastName, address, phone, pincode, username, password, createdAt) VALUES(?,?,?,?,?,?,?,?,?)";
    const [result] = await promiseConn.query(addQuery, [userId, firstName, lastName, address, phone,pincode, username, hashedPassword, createdAt]);
    if(result.affectedRows === 1){
        res.status(201).json({message: "User created successfully"});
    }
    else{
        res.status(400).json({message: "Failed to create user"});
    }
}
catch(e){
    res.status(500).json({message:"System error", error:e});
}
})



//Login
router.post('/login', async(req,res)=>{
    try{
        const {username, password} = req.body;
        const query = "SELECT * FROM users WHERE username = ?";
        const [result] = await promiseConn.query(query, [username]);
        if(result.affectedRows === 0){
            res.status(404).json({message: "User not found"});
        }
        const passMatch = await bcrypt.compare(password, result[0].password);
        if(!passMatch){
        return res.status(401).json({message: "Credentials Invalid! Check Again"});
        }


        const token = jwt.sign({
            userId: result[0].userId, username: result[0].username
        }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(200).send({token});
    }
    catch(e){
        res.status(500).json({message:"System error", error:e});
    }
})


module.exports = router;