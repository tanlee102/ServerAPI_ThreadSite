const express = require('express');
const app = express();
const session = require('express-session');
var bodyParser = require('body-parser');

app.use(session({ 
    secret: "passport",     
    resave: true,
    saveUninitialized: true,
}));

require('dotenv').config();

var cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./api/services/mongo.db');

require('./api/routes/home.router')(app);
require('./api/routes/page.router')(app);

console.log("Start main server port: "+process.env.PORT);
app.listen(process.env.PORT);