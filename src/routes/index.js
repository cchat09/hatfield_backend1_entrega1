const express = require('express');
const router = express.Router();

const productsRouter = require("./products.router");
const cartsRouter = require("./carts.router");

router.use("/products", productsRouter);
router.use("/carts", cartsRouter);

module.exports = router;