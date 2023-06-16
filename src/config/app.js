const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const app = express();
// Importe e configure as rotas e controladores do seu sistema
const jogadorRouter = require('./routes/jogador');
const timeRouter = require('./routes/time');
const partidaRouter = require('./routes/partida');

// Configurações do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurações do Session
app.use(
  session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }, // Tempo de expiração em milissegundos
  })
);

// Configurações do Flash
app.use(flash());

// Rotas e Controladores
app.use('/jogador', jogadorRouter);
app.use('/time', timeRouter);
app.use('/partida', partidaRouter);

// Middleware de erro para lidar com rotas inexistentes
app.use(function (req, res, next) {
  res.status(404).send('Página não encontrada');
});

// Middleware de erro para lidar com erros internos do servidor
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Erro interno do servidor');
});

// Iniciar o servidor
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Servidor em execução no port ${port}`);
});
