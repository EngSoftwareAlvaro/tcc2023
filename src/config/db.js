const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');

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

  fetchAndInsertData: async (table, url) => {
    try {
      const response = await axios.get(url);

      const data = response.data.response.map(item => {
        return {
          idJogador: item.id,
          idTime: item.team, // Preencha com o ID do time correspondente se disponível
          nome: item.firstname,
          sobrenome: item.lastname,
          idade: item.birth.date,
          altura: item.height.meters,
          posicao: item.leagues.standard.pos,
          camisa: item.leagues.standard.jersey,
        };
      });

      data.forEach(item => {
        db.insert(table, item);
      });

      console.log(`Dados da API salvos na tabela ${table} com sucesso!`);
    } catch (error) {
      console.error(`Erro ao buscar os dados da API para a tabela ${table}:`, error);
    }
  },
};

db.connect();

module.exports = db;
