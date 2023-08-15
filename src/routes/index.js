const db = require('../config/db'); // Importe o módulo de conexão com o banco de dados
const app = require('../config/app.js')

app.get('/times', (req, res) => {
  const query = 'SELECT * FROM time'; // Substitua pela sua consulta SQL
  db.query(query)
    .then(results => {
      const times = results; // Certifique-se de que os resultados da consulta estão na forma adequada
      res.render('times.ejs', { times });
    })
    .catch(error => {
      console.error('Erro ao buscar os times:', error);
      res.status(500).json({ error: 'Erro ao buscar os times' });
    });
});


app.get('/time/:timeId', (req, res) => {
  const timeId = req.params.timeId;

  // Consulta para obter informações do time
  const timeQuery = `SELECT * FROM time WHERE idTime = '${timeId}'`;

  // Consulta para obter jogadores do time
  const jogadoresQuery = `SELECT * FROM jogador WHERE idTime = '${timeId}'`;

  // Consulta para obter estatísticas do time
  const estatisticasQuery = `SELECT * FROM statstime WHERE idTime = '${timeId}'`;

  Promise.all([
    db.query(timeQuery),
    db.query(jogadoresQuery),
    db.query(estatisticasQuery)
  ])
    .then(results => {
      const timeResults = results[0];
      const jogadoresResults = results[1];
      const estatisticasResults = results[2];

      if (timeResults.length === 0) {
        res.status(404).json({ error: 'Time não encontrado' });
      } else {
        const time = timeResults[0];
        const jogadoresDoTime = jogadoresResults;
        const estatisticasDoTime = estatisticasResults.length > 0 ? estatisticasResults[0] : null;

        res.render('time.ejs', { time, jogadores: jogadoresDoTime, estatisticasDoTime });
      }
    })
    .catch(error => {
      console.error('Erro ao buscar os dados do time:', error);
      res.status(500).json({ error: 'Erro ao buscar os dados do time' });
    });
});



app.get('/jogador/:timeId/:jogadorId', (req, res) => {
  const timeId = req.params.timeId;
  const jogadorId = req.params.jogadorId;
  const query = `SELECT * FROM jogador WHERE idJogador = '${jogadorId}' AND idTime = '${timeId}'`;
  db.query(query, [jogadorId, timeId])
    .then(results => {
      if (results.length === 0) {
        res.status(404).json({ error: 'Jogador não encontrado' });
      } else {
        const jogador = results[0];
        res.render('jogador.ejs',{jogador });
      }
    })
    .catch(error => {
      console.error('Erro ao buscar os dados do jogador:', error);
      res.status(500).json({ error: 'Erro ao buscar os dados do jogador' });
    });
});

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
