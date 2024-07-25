const express = require('express');
const app = express();
const routes = require("./src/routes")

const port = 8080;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('This is a server')
});

app.use("/api", routes);

app.listen(port, () => {
    console.log(`Server listening at port: http://localhost:${port}`);
    });

