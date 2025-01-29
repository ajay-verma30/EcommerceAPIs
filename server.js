const express = require('express');
const app = express();
const morgan = require('morgan');

require('dotenv').config();

//middelwares
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(express.json());
app.use('/users', require('./Routes/users.js'));
app.use('/products', require('./Routes/product.js'));
app.use('/category', require('./Routes/category.js'));
app.use('/orders', require('./Routes/orders.js'));


const port = process.env.PORT||3001;

app.get('/',(req,res)=>{
    console.log('working')
    res.send('working')
})

app.listen(port)