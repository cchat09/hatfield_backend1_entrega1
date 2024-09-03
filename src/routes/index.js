const express = require('express');
const router = express.Router();

const productsRouter = require("./products.router");
const cartsRouter = require("./carts.router");

router.use("/products", productsRouter);
router.use("/carts", cartsRouter);

router.get('/', (req, res) => {
    res.send('Products router is connected!');
});

module.exports = router;