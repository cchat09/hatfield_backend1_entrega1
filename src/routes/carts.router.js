const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

router.get('/test', (req, res) => {
    res.send('Test route working');
});

// Add new cart
router.post('/', async (req, res) => {
    console.log("POST /carts hit");
    try {
        const newCart = new Cart({ cid: await Cart.countDocuments() + 1, cartProducts: [] });
        await newCart.save();
        res.status(201).json(newCart);
    } catch (err) {
        res.status(500).json({ message: 'Error creating cart', error: err.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        // Find the cart by cid and populate the cartProducts' pid field
        const cart = await Cart.findOne({ cid: Number(cid) }).populate('cartProducts.pid');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving cart', error: error.message });
    }
});


// Add product to existing cart
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const objectIdPid = new mongoose.Types.ObjectId(pid); // Convert pid to ObjectId

        const cart = await Cart.findOne({ cid: Number(cid) });
        const product = await Product.findById(objectIdPid); // Find product by ObjectId

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productInCart = cart.cartProducts.find(p => p.pid.toString() === objectIdPid.toString()); // Compare ObjectId correctly
        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.cartProducts.push({ pid: objectIdPid, quantity: 1 }); // Use ObjectId here
        }

        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Error adding product to cart', error: err.message });
    }
});


// Delete specified product from specified cart
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        console.log(pid);

        const objectIdPid = new mongoose.Types.ObjectId(pid);
        const numberCid = Number(cid);

        const cart = await Cart.findOne({ cid: numberCid });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productInCart = cart.cartProducts.find(p => {
            console.log('Comparing product pid:', p.pid.toString(), 'with:', objectIdPid.toString());
            return p.pid.equals(objectIdPid);
        });

        if (productInCart) {
            productInCart.quantity -= 1;
            if (productInCart.quantity === 0) {
                // Remove the product if quantity is zero
                cart.cartProducts = cart.cartProducts.filter(p => !p.pid.equals(objectIdPid));
            }
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product from cart', error: err.message });
    }
});

// Delete all products from the cart
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findOneAndUpdate({ cid }, { cartProducts: [] }, { new: true });
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error clearing cart', error: err.message });
    }
});

// Update all products in a cart
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const newProducts = req.body; // Array of products to replace the existing ones

        if (!Array.isArray(newProducts)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        // Find the cart and update its products
        const cart = await Cart.findOne({ cid: Number(cid) });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.cartProducts = newProducts.map(product => ({
            pid: new mongoose.Types.ObjectId(product.pid),
            quantity: product.quantity
        }));

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
});


module.exports = router;
