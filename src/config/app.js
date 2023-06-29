const path = require('path');
const express = require("express");
const ejs = require('ejs');

const app = express();

// Configurações do Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../pages/views"));




module.exports = app;