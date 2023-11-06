const path = require('path');
const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();

// Configurar o middleware body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configurações do Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../pages/views"));




module.exports = app;