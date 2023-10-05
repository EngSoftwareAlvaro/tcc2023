const db = require('../config/db'); // Importe o módulo de conexão com o banco de dados
const app = require('../config/app.js')
const { fazerPrognostico } = require('../controllers/prognostico');

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

  const partidasQuery = `
  SELECT DISTINCT P.idPartida, P.*, 
    CASE
      WHEN P.home = '${timeId}' THEN (SELECT nome FROM time WHERE idTime = P.visitor)
      ELSE (SELECT nome FROM time WHERE idTime = P.home)
    END AS timeAdversario,
    CASE
      WHEN P.home = '${timeId}' THEN (SELECT logo FROM time WHERE idTime = P.visitor)
      ELSE (SELECT logo FROM time WHERE idTime = P.home)
    END AS logoAdversario
  FROM partidas P
  WHERE P.home = '${timeId}' OR P.visitor = '${timeId}'
`;

  Promise.all([
    db.query(timeQuery),
    db.query(jogadoresQuery),
    db.query(estatisticasQuery),
    db.query(partidasQuery)
  ])
    .then(results => {
      const timeResults = results[0];
      const jogadoresResults = results[1];
      const estatisticasResults = results[2];
      const partidasResults = results[3];

      if (timeResults.length === 0) {
        res.status(404).json({ error: 'Time não encontrado' });
      } else {
        const time = timeResults[0];
        const jogadoresDoTime = jogadoresResults;
        const estatisticasDoTime = estatisticasResults.length > 0 ? estatisticasResults[0] : null;
        const partidas = partidasResults;
  
        res.render('time.ejs', { time, jogadores: jogadoresDoTime, estatisticasDoTime, partidas });
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
    SELECT * FROM jogador WHERE idJogador = ? AND idTime = ?
  `;
  const timeQuery = `
    SELECT idTime, logo FROM time WHERE idTime = ?
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
      AVG(rebotes) AS mediaTotReb,
      AVG(assistencias) AS mediaAssists,
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
  const partidasQuery = `
  SELECT DISTINCT P.idPartida, P.*, 
    CASE
      WHEN P.home = ? THEN (SELECT nome FROM time WHERE idTime = P.visitor)
      ELSE (SELECT nome FROM time WHERE idTime = P.home)
    END AS timeAdversario,
    CASE
      WHEN P.home = ? THEN (SELECT logo FROM time WHERE idTime = P.visitor)
      ELSE (SELECT logo FROM time WHERE idTime = P.home)
    END AS logoAdversario
  FROM partidas P
  WHERE P.home = ? OR P.visitor = ?
`;
  
  // Executar as duas consultas em paralelo
  Promise.all([
    db.query(jogadorQuery, [jogadorId, timeId]),
    db.query(mediaQuery, [jogadorId]),
    db.query(timeQuery, [timeId]),
    db.query(partidasQuery, [timeId,timeId,timeId,timeId])
  ])
    .then(results => {
      const jogador = results[0][0]; // Resultado da primeira consulta
      const media = results[1][0];   // Resultado da segunda consulta
      const time = results[2][0];
      const partidas = results[3];

      if (!jogador) {
        res.status(404).json({ error: 'Jogador não encontrado' });
      } else {
        // Calcula a idade usando a função calculateAge
        jogador.idade = calculateAge(jogador.idade);
        // Mapeie a posição usando a função getPositionName
        jogador.posicao = getPositionName(jogador.posicao);
        res.render('jogador.ejs', { jogador, media, time, partidas });
      }
    })
    .catch(error => {
      console.error('Erro ao buscar os dados do jogador:', error);
      res.status(500).json({ error: 'Erro ao buscar os dados do jogador' });
    });
});


app.get('/partida/:idPartida', async (req, res) => {
  const idPartida = req.params.idPartida;

  // Consulta para obter os detalhes da partida
  const partida = await db.query('SELECT * FROM partidas WHERE idPartida = ?', [idPartida]);

  if (partida.length === 0) {
    // Partida não encontrada
    return res.status(404).send('Partida não encontrada');
  }

  const partidaInfo = partida[0];

  // Consulta para obter os detalhes do time A (home)
  const timeADetails = await db.query('SELECT * FROM time WHERE idTime = ?', [partidaInfo.home]);

  // Consulta para obter os detalhes do time B (visitor)
  const timeBDetails = await db.query('SELECT * FROM time WHERE idTime = ?', [partidaInfo.visitor]);

  const timeALineup = await db.query('SELECT * FROM jogador WHERE idTime = ?', [partidaInfo.home]);
  const timeBLineup = await db.query('SELECT * FROM jogador WHERE idTime = ?', [partidaInfo.visitor]);

  const statsTA = await db.query('SELECT * FROM statstime WHERE idTime = ?', [partidaInfo.home]);
  const statsTB = await db.query('SELECT * FROM statstime WHERE idTime = ?', [partidaInfo.visitor]);

  if (timeADetails.length === 0 || timeBDetails.length === 0) {
    // Um ou ambos os times não foram encontrados
    return res.status(404).send('Um ou ambos os times não foram encontrados');
  }

  const timeA = timeADetails[0];
  const timeB = timeBDetails[0];

  // Consulta para obter a próxima partida da equipe da casa que ainda não ocorreu
  const nextGame = await db.query(
    'SELECT date FROM partidas WHERE home = ? AND date >= NOW() ORDER BY date ASC LIMIT 1',
    [timeA.idTime]
  );

  // Agora, para cada jogador em timeALineup e timeBLineup, calcule o prognóstico
  const prognosticosTimeA = [];
  const prognosticosTimeB = [];

  for (const jogador of timeALineup) {
    const prognostico = await fazerPrognostico(jogador);
    prognosticosTimeA.push(prognostico);
  }

  for (const jogador of timeBLineup) {
    const prognostico = await fazerPrognostico(jogador);
    prognosticosTimeB.push(prognostico);
  }

  // Renderize a página da partida e passe os dados da partida, dos times, da próxima partida da equipe da casa e dos prognósticos para o modelo
  res.render('partida', { partida: partidaInfo, timeA, timeB, nextGame, timeALineup, timeBLineup, statsTA, statsTB, prognosticosTimeA, prognosticosTimeB });
});



app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});
