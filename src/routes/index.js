const db = require('../config/db'); // Importe o módulo de conexão com o banco de dados
const app = require('../config/app.js')

// Função para mapear as posições
function getPositionName(posicao) {
  switch (posicao) {
    case 'C':
      return 'Pivô';
    case 'F-G':
      return 'Ala-pivô';
    case 'G':
      return 'Armador';
    case 'F-C':
    case 'G-F':
      return 'Ala-armador';
    case 'F':
      return 'Ala';
    default:
      return 'Desconhecido';
  }
}

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




function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

app.get('/jogador/:timeId/:jogadorId', (req, res) => {
  const timeId = req.params.timeId;
  const jogadorId = req.params.jogadorId;
  
  // Consulta para retornar os dados do jogador
  const jogadorQuery = `
    SELECT * FROM jogador WHERE idJogador = '${jogadorId}' AND idTime = '${timeId}'
  `;
  const timeQuery = `
    SELECT idTime, logo FROM time WHERE idTime = '${timeId}'
  `;
  // Consulta para calcular a média de ocorrências dos campos e o total de jogos
  const mediaQuery = `
    SELECT
      AVG(fgm) AS mediaFgm,
      AVG(fga) AS mediaFga,
      AVG(fgp) AS mediaFgp,
      AVG(ftm) AS mediaFtm,
      AVG(fta) AS mediaFta,
      AVG(ftp) AS mediaFtp,
      AVG(tpm) AS mediaTpm,
      AVG(tpa) AS mediaTpa,
      AVG(tpp) AS mediaTpp,
      AVG(offReb) AS mediaOffReb,
      AVG(defReb) AS mediaDefReb,
      AVG(totReb) AS mediaTotReb,
      AVG(assists) AS mediaAssists,
      AVG(pFouls) AS mediaPFouls,
      AVG(steals) AS mediaSteals,
      AVG(turnovers) AS mediaTurnovers,
      AVG(blocks) AS mediaBlocks,
      AVG(plusMinus) AS mediaPlusMinus,
      AVG(pontos) AS mediaPontos,
      AVG(CONVERT(SUBSTRING_INDEX(minutos, ':', 1), UNSIGNED)) AS mediaMinutosMin,
      AVG(CONVERT(SUBSTRING_INDEX(SUBSTRING_INDEX(minutos, ':', -1), '.', 1), UNSIGNED)) AS mediaMinutosSeg,
      COUNT(*) AS totalJogos
    FROM statsJogador
    WHERE idJogador = ?
  `;
  
  // Executar as duas consultas em paralelo
  Promise.all([
    db.query(jogadorQuery),
    db.query(mediaQuery, [jogadorId]),
    db.query(timeQuery)
  ])
    .then(results => {
      const jogador = results[0][0]; // Resultado da primeira consulta
      const media = results[1][0];   // Resultado da segunda consulta
      const time = results[2][0];

      if (!jogador) {
        res.status(404).json({ error: 'Jogador não encontrado' });
      } else {
        // Calcula a idade usando a função calculateAge
        jogador.idade = calculateAge(jogador.idade);
        // Mapeie a posição usando a função getPositionName
        jogador.posicao = getPositionName(jogador.posicao);
        res.render('jogador.ejs', { jogador, media, time });
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
