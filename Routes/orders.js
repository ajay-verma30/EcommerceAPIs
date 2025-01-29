const express = require('express');
const router = express.Router();
const ShortUniqueId = require('short-unique-id');
const uuid = new ShortUniqueId({ length: 10 }); // ✅ Fixed typo from 'lenght' to 'length'
require('../db/conn');
const mysqli = require('../db/conn');
const dataConnection = mysqli();
const promiseConn = dataConnection.promise();
const authenticateToken = require('../middleware/decodeToken');

router.post('/placeorder', authenticateToken, async (req, res) => {
    try {
        const orderId = uuid.rnd(); 
        const orderDate = new Date();
        const { userId, productIds, totalAmount, shippingAddress } = req.body;
        if (!userId || !Array.isArray(productIds) || productIds.length === 0 || !shippingAddress || !totalAmount) {
            return res.status(400).json({ message: "Order cannot be placed with empty or invalid fields" });
        }
        const productIdsJson = JSON.stringify(productIds);
        const createOrder = `
            INSERT INTO orders (orderId, userId, productIds, orderDate, totalAmount, orderStatus, shippingAddress) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await promiseConn.query(createOrder, [
            orderId, userId, productIdsJson, orderDate, totalAmount, "pending", shippingAddress
        ]);
        if (result.affectedRows === 1) {
            return res.status(201).json({ message: "Order has been placed successfully", orderId });
        } else {
            return res.status(400).json({ message: "Something went wrong, please try again!" });
        }
    } catch (e) {
        console.error("Error placing order:", e);
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
});

router.get('/myorders', authenticateToken, async (req, res) => {
    try {
        // Access the userId from the body correctly
        const { userId } = req.body; 

        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        const myOrdersQuery = `
            SELECT DISTINCT
                orders.userId, 
                orders.orderId, 
                orders.productIds, 
                orders.totalAmount, 
                orders.orderDate, 
                products.productName, 
                products.productPrice
            FROM orders 
            JOIN users ON users.userId = orders.userId
            JOIN products ON JSON_CONTAINS(orders.productIds, JSON_QUOTE(products.productId))
            WHERE users.userId = ?
        `;

        const [result] = await promiseConn.query(myOrdersQuery, [userId]);

        if (result.length > 0) {
            const ordersArray = result;
            return res.status(200).json({ ordersArray });
        }

        return res.status(400).send("No orders found yet!");
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// router.get('/myorders', authenticateToken, async (req, res) => {
//     try {
//         const userId = req.body;
//         const myOrdersQuery = `
//             SELECT
//              orders.userId, 
//              orders.orderId, 
//              orders.productIds, 
//              orders.totalAmount, 
//              orders.orderDate, 
//              products.productName, 
//              products.productPrice
//              From orders 
//              JOIN users ON users.userId = orders.userId
//              Join products ON JSON_CONTAINS(orders.productIds, JSON_QUOTE(products.productId))
//             WHERE users.userId = ?
//         `;
//         const [result] = await promiseConn.query(myOrdersQuery, [userId]);

//         if (result.length > 0) {
//             const ordersArray = result;
//             for (let i = 0; i < ordersArray.length; i++) {
//                 const products = ordersArray[i].productIds;
//                 for (let j = 0; j < products.length; j++) {
//                     console.log(products[j]); 
//                 }
//             }
//             return res.status(200).json({ ordersArray });
//         }
//         return res.status(400).send("No orders found yet!");
//     } catch (error) {
//         console.error("Error fetching orders:", error);
//         return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// });


module.exports = router;
