const express = require('express');
const router = express.Router();
const shortUniquId = require('short-unique-id')
const uuid = new shortUniquId({lenght: 10})
require('../db/conn');
const mysqli = require('../db/conn');
const dataConnection = mysqli();
const promiseConn = dataConnection.promise();
const authenticateToken = require('../middleware/decodeToken');

router.post('/new', authenticateToken, async (req, res) => {
    try{
    const { productName, categoryName, productDescription, productPrice, availability, totalStock } = req.body;
    const searchCategory = "SELECT * from categories WHERE categoryName = ?"
    const [catResult] = await promiseConn.query(searchCategory, [categoryName])
    if(catResult.length > 0){
        const categoryId = catResult[0].categoryId;
        const productId = uuid.rnd();
        const addProduct = "INSERT INTO products (productId, productName, category, productDescription, productPrice, availability, totalStock) VALUES(?,?,?,?,?,?,?)";
        const [result] = await promiseConn.query(addProduct, [productId,productName,categoryId, productDescription, productPrice,availability, totalStock ]);
        if(result.affectedRows ===1){
            return res.status(201).json({message:"Product added successfully"});
        }
        return res.status(400).json({message:"Unable to add product"});
        }
        return res.status(401).json({message:"Category is not added yet"});
    }
    catch(e){
        return res.status(500).json({message:"Unable to add product", error:e});
    }
})


router.get('/allproducts', async (req,res)=>{
    try{
        const query = "SELECT * FROM products";
    const result = await promiseConn.query(query);
    res.status(200).json(result[0]);
    }
    catch(e){
        res.status(500).json({message:"Unable to fetch product", error:e});
    }
})

module.exports = router;