const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fetch = require('node-fetch');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "tcc2023",
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
            const response = await fetch(url);
            const data = await response.json();

            for (const item of data) {
                db.insert(table, item);
            }
        } catch (error) {
            console.error(`Erro ao buscar os dados da API para a tabela ${table}:`, error);
        }
    },
};

db.connect();

// Criação das tabelas

const createTables = () => {
    const createPartidasTable = `CREATE TABLE IF NOT EXISTS partidas (
        id_partida INT PRIMARY KEY AUTO_INCREMENT,
        local VARCHAR(100),
        data DATE,
        horario TIME,
        id_time INT,
        id_prognostico INT,
        FOREIGN KEY (id_time) REFERENCES times (id_time),
        FOREIGN KEY (id_prognostico) REFERENCES prognosticos (id_prognostico)
    )`;

    const createTimesTable = `CREATE TABLE IF NOT EXISTS times (
        id_time INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(100),
        conferencia VARCHAR(100),
        ginasio VARCHAR(100),
        id_stats_times INT,
        id_jogador INT,
        FOREIGN KEY (id_stats_times) REFERENCES stats_times (id_stats_times),
        FOREIGN KEY (id_jogador) REFERENCES jogadores (id_jogador)
    )`;

    const createJogadoresTable = `CREATE TABLE IF NOT EXISTS jogadores (
        id_jogador INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(100),
        altura FLOAT,
        idade INT,
        posicao VARCHAR(100),
        id_stats_jogadores INT,
        FOREIGN KEY (id_stats_jogadores) REFERENCES stats_jogadores (id_stats_jogadores)
    )`;

    const createPrognosticosTable = `CREATE TABLE IF NOT EXISTS prognosticos (
        id_prognostico INT PRIMARY KEY AUTO_INCREMENT,
        id_jogador INT,
        prognostico VARCHAR(100),
        FOREIGN KEY (id_jogador) REFERENCES jogadores (id_jogador)
    )`;

    const createStatsTimesTable = `CREATE TABLE IF NOT EXISTS stats_times (
        id_stats_times INT PRIMARY KEY AUTO_INCREMENT,
        pontos INT,
        assistencias INT,
        rebotes INT,
        tentativas_3pts INT,
        convertidas_3pts INT,
        tentativas_2pts INT,
        convertidas_2pts INT,
        tentativas_LL INT,
        convertidas_LL INT,
        faltas_time INT
    )`;

    const createStatsJogadoresTable = `CREATE TABLE IF NOT EXISTS stats_jogadores (
        id_stats_jogadores INT PRIMARY KEY AUTO_INCREMENT,
        pontos INT,
        assistencias INT,
        rebotes INT,
        tentativas_3pts INT,
        convertidas_3pts INT,
        tentativas_2pts INT,
        convertidas_2pts INT,
        tentativas_LL INT,
        convertidas_LL INT,
        faltas INT
    )`;

    db.query(createPartidasTable)
        .then(() => db.query(createTimesTable))
        .then(() => db.query(createJogadoresTable))
        .then(() => db.query(createPrognosticosTable))
        .then(() => db.query(createStatsTimesTable))
        .then(() => db.query(createStatsJogadoresTable))
        .then(() => {
            console.log('Tabelas criadas com sucesso!');
            // Chamada para buscar os dados da API e inserir nas tabelas
            db.fetchAndInsertData('jogadores', 'https://api-nba-v1.p.rapidapi.com/players');
            db.fetchAndInsertData('times', 'https://api-nba-v1.p.rapidapi.com/teams');
            db.fetchAndInsertData('partidas', 'https://api-nba-v1.p.rapidapi.com/games');
        })
        .catch(error => console.error('Erro ao criar as tabelas:', error));
};

createTables();

module.exports = db;
