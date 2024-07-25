
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Define path to the JSON file
const productsFilePath = path.join(__dirname, '../data/products.json');
const cartsFilePath = path.join(__dirname, '../data/carts.json');


// Helper function to read JSON files
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return [];
    }
};

// Helper function to write to JSON files
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error(`Error writing to file ${filePath}:`, err);
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

// Determine the next available product ID
let nextId = products.length > 0 ? Math.max(...products.map(p => p.pid || 0)) + 1 : 1;

// Get all products
router.get('/', (req, res) => {
    res.json(products);
});

// Get a specific product by ID
router.get('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid, 10);
    const product = products.find(p => p.pid === productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).send({ message: 'Product not found' });
    }
});

// Add a new product
router.post('/', (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || price === undefined || status === undefined || stock === undefined || !category) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    const newProduct = {
        pid: nextId++,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    writeJsonFile(productsFilePath, products);
    res.status(201).json(newProduct);
});

/*
POSTMAN TEXT ONHAND TO ADD PRODUCT:
{
    "title": "PRODUCT A",
    "description": "This is a description of the new product.",
    "code": "NP123",
    "price": 99.99,
    "status": true,
    "stock": 50,
    "category": "New Category",
    "thumbnails": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
    ]
}
*/

// Delete a product by ID
router.delete('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid, 10);
    const productIndex = products.findIndex(p => p.pid === productId);

    if (productIndex !== -1) { 
        products.splice(productIndex, 1);

        //remove from carts
        carts.forEach(cart => {
            const productInCartIndex = cart.cartProducts.findIndex(p => p.pid === productId);
                if (productInCartIndex !== -1) {
                    cart.cartProducts.splice(productInCartIndex, 1);
                }
            });
        writeJsonFile(productsFilePath, products);
        saveCartsToFile();
        res.status(204).send({ message: 'Product deleted' });
    } else {
        res.status(404).send({ message: 'Product not found' });
    }
});

// Update a product by ID
router.put('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid, 10);
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const product = products.find(p => p.pid === productId);

    if (product) {
        if (title !== undefined) product.title = title;
        if (description !== undefined) product.description = description;
        if (code !== undefined) product.code = code;
        if (price !== undefined) product.price = price;
        if (status !== undefined) product.status = status;
        if (stock !== undefined) product.stock = stock;
        if (category !== undefined) product.category = category;
        if (thumbnails !== undefined) product.thumbnails = thumbnails;

        writeJsonFile(productsFilePath, products);
        res.status(200).json(product);
    } else {
        res.status(404).send({ message: 'Product not found' });
    }
});

module.exports = router;
