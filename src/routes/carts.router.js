const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Define paths to JSON files
const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Helper function to read JSON files
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.log(`Error reading file ${filePath}:`, err);
        return [];
    }
};

// Helper function to write to JSON files
const saveCartsToFile = () => {
    try {
        fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), 'utf-8');
    } catch (err) {
        console.error(`Error writing to file ${cartsFilePath}:`, err);
    }
};

// Load data from file
let products = readJsonFile(productsFilePath);
let carts = readJsonFile(cartsFilePath);

let nextId = carts.length > 0 ? Math.max(...carts.map(c => c.cid)) + 1 : 1;

// Add new cart
router.post('/', (req, res) => {
    const newCart = {
        cid: nextId++,
        cartProducts: [],
    };

    carts.push(newCart);
    saveCartsToFile();
    res.status(201).json(newCart);
});

// See selected cart
router.get('/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    const cart = carts.find(c => c.cid === cartId);

    if (cart) {
        res.json(cart);
    } else {
        res.status(404).send({ message: 'Cart not found' });
    }
});

// Add product to existing cart
router.post('/:cid/product/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    const productId = parseInt(req.params.pid, 10);

    const cart = carts.find(c => c.cid === cartId);
    const product = products.find(p => p.pid === productId);

    if (!cart) {
        return res.status(404).send({ message: 'Cart not found' });
    }
    if (!product) {
        return res.status(404).send({ message: 'Product not found' });
    }

    const productInCart = cart.cartProducts.find(p => p.pid === productId);
    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.cartProducts.push({ pid: productId, quantity: 1 });
    }

    saveCartsToFile();
    res.status(200).json(cart);
});

// Delete specified product from specified cart
router.delete('/:cid/product/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid, 10);
    const productId = parseInt(req.params.pid, 10);

    const cart = carts.find(c => c.cid === cartId);
    const product = products.find(p => p.pid === productId);

    if (!cart) {
        return res.status(404).send({ message: 'Cart not found' });
    }
    if (!product) {
        return res.status(404).send({ message: 'Product not found' });
    }

    const productInCart = cart.cartProducts.find(p => p.pid === productId);
    if (productInCart) {
        productInCart.quantity -= 1;
        if (productInCart.quantity === 0) {
            cart.cartProducts = cart.cartProducts.filter(p => p.pid !== productId);
        }

        saveCartsToFile();
        res.status(200).json(cart);
    } else {
        res.status(404).send({ message: 'Product not found in cart' });
    }
});

module.exports = router;
