const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  insecureAuth: process.env.DB_INSECURE_AUTH
});


const db = {
  connect: () => {
    connection.connect((error) => {
      if (error) return console.error(error);
      console.log("Connected....!!");
    });
  },

  query: (q, data) => {
    return new Promise((resolve, reject) => {
      connection.query(q, data, (err, res) => {
        err ? reject(err) : resolve(res);
      });
    });
  },

  end: () => {
    connection.end((err) => {
      if (err) return console.error(err.toString());
      console.log("Connection closed...!");
    });
  },

  insert: (table, data) => {
    const sql = `INSERT INTO ${table} SET ?`;
    db.query(sql, data)
      .then(result => console.log('Dados inseridos com sucesso:', result.affectedRows))
      .catch(error => console.error('Erro ao inserir os dados:', error));
  },

};

db.connect();

module.exports = db;
