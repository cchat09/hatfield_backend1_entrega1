const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all products with optional query params
// router.get('/', async (req, res) => {
//     try {
//         const { limit = 10, page = 1, sort, category, price, status } = req.query;
//         // const filters = query ? { category: query } : {};
//         const filters = {};
//         if (category) {
//             filters.category = category; // Filter by category
//         }
//         if (price) {
//             filters.price = Number(price); // Exact match for price
//         }
//         if (status !== undefined) {
//             filters.status = status === 'true'; // Filter by boolean status
//         }
//         const sortOption = sort === 'asc' ? { price: 1 } : (sort === 'desc' ? { price: -1 } : {});
//         const products = await Product.find(filters).sort(sortOption).limit(Number(limit)).skip((page - 1) * limit);
//         const totalProducts = await Product.countDocuments(filters);
//         const totalPages = Math.ceil(totalProducts / limit);
        
//         const response = {
//             status: 'success',
//             payload: products,
//             totalPages,
//             prevPage: page > 1 ? page - 1 : null,
//             nextPage: page < totalPages ? page + 1 : null,
//             page: Number(page),
//             hasPrevPage: page > 1,
//             hasNextPage: page < totalPages,
//             prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
//             nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null
//         };

//         // Use JSON.stringify to pretty-print with 2-space indentation
//         res.send(JSON.stringify(response, null, 2));
//     } catch (error) {
//         res.status(500).json({ status: 'error', message: error.message });
//     }
// });

// Get all products with optional query params
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category, price, status } = req.query;
        const filters = {};

        if (category) filters.category = category; // Filter by category
        if (price) filters.price = Number(price); // Exact match for price
        if (status !== undefined) filters.status = status === 'true'; // Filter by boolean status

        const sortOption = sort === 'asc' ? { price: 1 } : (sort === 'desc' ? { price: -1 } : {});

        const products = await Product.find(filters)
            .sort(sortOption)
            .limit(Number(limit))
            .skip((page - 1) * limit);

        const totalProducts = await Product.countDocuments(filters);
        const totalPages = Math.ceil(totalProducts / limit);
        console.log(totalPages);
        console.log(totalProducts);

        // Pagination details
        const pagination = {
            totalPages,
            currentPage: Number(page),
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort}&category=${category}&price=${price}&status=${status}` : null,
            nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${sort}&category=${category}&price=${price}&status=${status}` : null,
        };

        console.log(pagination);

        // Render the Handlebars template and pass the necessary data
        res.render('realTimeProducts', {
            products,
            pagination
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


// Get a specific product by ID
router.get('/:pid', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const product = await Product.findById(req.params.pid);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Error retreiving product', error: error.message });
    }
});

// Add a new product
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || price === undefined || status === undefined || stock === undefined || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const newProduct = new Product({ title, description, code, price, status, stock, category, thumbnails });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

//BULK ADD
// Add multiple products
router.post('/bulk', async (req, res) => {
    try {
        const products = req.body; // Expecting an array of product objects

        // Validate that products is an array and has at least one product
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Invalid input: Expected an array of products' });
        }

        // Validate each product in the array
        for (const product of products) {
            const { title, description, code, price, status, stock, category, thumbnails } = product;
            if (!title || !description || !code || price === undefined || status === undefined || stock === undefined || !category) {
                return res.status(400).json({ message: 'Missing required fields in one or more products' });
            }
        }

        // Insert multiple products
        const result = await Product.insertMany(products);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});



// Delete a product by ID
router.delete('/:pid', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.pid);
        if (product) {
            res.status(204).json({ message: 'Product deleted' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Error deleting product', error: error.message });
    }
});

// Update a product by ID
router.put('/:pid', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        const updates = { title, description, code, price, status, stock, category, thumbnails };
        const product = await Product.findByIdAndUpdate(req.params.pid, updates, { new: true, runValidators: true });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Error updating product', error: error.message });
    }
});

// Route to render individual product view
router.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.render('individualProduct', { product });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;

