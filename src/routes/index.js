const db = require('../config/db'); // Importe o módulo de conexão com o banco de dados
const app = require('../config/app.js')

app.get('/jogador/:timeId/:jogadorId', (req, res) => {
  const timeId = req.params.timeId;
  const jogadorId = req.params.jogadorId;
  console.log(jogadorId);
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
