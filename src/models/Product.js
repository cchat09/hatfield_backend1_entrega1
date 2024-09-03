const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    pid: Number,
    title: String,
    description: String,
    code: String,
    price: Number,
    status: Boolean,
    stock: Number,
    category: String,
    thumbnails: [String],
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;