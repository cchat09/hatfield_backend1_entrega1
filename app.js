const express = require('express');
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const handlebars = require('express-handlebars');
const routes = require('./src/routes');
const Product = require('./src/models/Product');

// Create server and socket.io
const server = http.createServer(app);
const io = socketIo(server);

const dbURI = 'mongodb+srv://ccullenhatfield:5UlvXZhX6HFDYCm1@cluster0.8bd1t.mongodb.net/Hatfield_backend?retryWrites=true&w=majority';

// MongoDB connection
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Handlebars setup with prototype access enabled
app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, 'src', 'views'));

// Routes
app.use('/products', require('./src/routes/products.router'));
app.use('/carts', require('./src/routes/carts.router'));

// app.get('/products', (req, res) => {
//     res.render('index', { products });
// });

app.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch products from MongoDB
    res.render('realTimeProducts', { products }); // Pass products to Handlebars view
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

app.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Fetch product using MongoDB's _id
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.render('individualProduct', { product }); // Render the Handlebars view
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});


// Socket.io events
io.on('connection', async (socket) => {
  console.log('New client connected');

  // Handle socket events as needed, depending on your app's requirements

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Server
const PORT = process.env.PORT || 8082;
server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
