const express = require('express');
const app = express();

const handlebars = require('express-handlebars');
const path = require("path");
const routes = require('./src/routes');

const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 8081;

app.use(express.json());


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'src', 'public')));

let products = [
    // Example products
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
];


// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.emit('updateProducts', products);

  socket.on('addProduct', (product) => {
      products.push(product);
      io.emit('updateProducts', products);
  });

  socket.on('deleteProduct', (productId) => {
      products = products.filter(product => product.id !== productId);
      io.emit('updateProducts', products);
  });

  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});



app.get('/products', (req, res) => {
    res.render('index', { products });
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products });
});


app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, 'src', 'views'));

app.get("/fufu/:nombre", (req, res) => {
  const {nombre} = req.params;
  res.render('index', {nombre})
});

// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en http://localhost:${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})