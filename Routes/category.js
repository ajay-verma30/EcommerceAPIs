const express = require('express');
const router = express.Router();
const shortUniquId = require('short-unique-id')
const uuid = new shortUniquId({lenght: 10})
require('../db/conn');
const mysqli = require('../db/conn');
const dataConnection = mysqli();
const promiseConn = dataConnection.promise();
const authenticateToken = require('../middleware/decodeToken');


router.post('/new', authenticateToken ,async(req,res)=>{
try{
    const {categoryName, categoryDescription} = req.body;
    
    //existing category
    const [existinCategory] = await promiseConn.query('SELECT * FROM categories WHERE categoryName = ?', [categoryName]);
    if (existinCategory.length > 0) {
        return res.status(409).send("Category already exists");
    }
    const categoryId = uuid.rnd();
    const addCategory = "INSERT INTO categories (categoryId, categoryName, categoryDescription) VALUES (?, ?, ?)";
    const [result] = await promiseConn.query(addCategory,[categoryId, categoryName, categoryDescription]);
    if(result.affectedRows === 1){
       return res.status(201).json({message:"Category created"});
    }
    return res.status(400).json({message:"unable to add Category"})
}
catch(e){
   return res.status(500).json({message:"Not able to add category", error:e});
}
})



module.exports = router;