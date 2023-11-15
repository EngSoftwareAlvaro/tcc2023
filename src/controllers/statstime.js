const axios = require('axios');
const db = require('../config/db');

// Mapeamento de IDs
const idMapping = {
    1: 1,   // Atlanta Hawks
    2: 2,   // Boston Celtics
    15: 3,  // Indiana Pacers
    4: 4,   // Brooklyn Nets
    5: 5,   // Charlotte Hornets
    6: 6,   // Chicago Bulls
    7: 7,   // Cleveland Cavaliers
    8: 8,   // Dallas Mavericks
    9: 9,   // Denver Nuggets
    10: 10, // Detroit Pistons
    11: 11, // Golden State Warriors
    16: 12, // LA Clippers
    17: 13, // Los Angeles Lakers
    19: 14, // Memphis Grizzlies
    20: 15, // Miami Heat
    21: 16, // Milwaukee Bucks
    22: 17, // Minnesota Timberwolves
    23: 18, // New Orleans Pelicans
    24: 19, // New York Knicks
    25: 20, // Oklahoma City Thunder
    26: 21, // Orlando Magic
    27: 22, // Philadelphia 76ers
    28: 23, // Phoenix Suns
    29: 24, // Portland Trail Blazers
    30: 25, // Sacramento Kings
    31: 26, // San Antonio Spurs
    38: 27, // Toronto Raptors
    40: 28, // Utah Jazz
    41: 29, // Washington Wizards
    14: 30, // Houston Rockets
};

// Variáveis para controlar o tempo entre as solicitações
let requestCount = 0;
const requestsPerMinute = 300;
const interval = 120000; // 120 segundos (2 minuto)

// Função para buscar e salvar estatísticas para ambos os times em uma partida
async function fetchAndSaveStatsForBothTeams(idPartida) {
  try {
    requestCount++;

    // Se exceder as 10 solicitações por minuto, aguarde o tempo restante do intervalo antes da próxima solicitação
    if (requestCount > requestsPerMinute) {
      const remainingTime = interval;
      console.log(`Excedeu o limite de ${requestsPerMinute} solicitações por minuto. Aguardando ${remainingTime / 1000} segundos antes da próxima solicitação.`);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      requestCount = 1;
    }

    // O restante do código para buscar e salvar estatísticas...
    const options = {
      method: 'GET',
      url: 'https://api-nba-v1.p.rapidapi.com/games/statistics',
      params: { id: idPartida },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // Substitua pelo seu RapidAPI Key
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST // Substitua pelo seu RapidAPI Host
        }
    };
  
      const response = await axios.request(options);
      const statsData = response.data;
  
      // Certifique-se de que a resposta contenha informações sobre ambos os times
      if (statsData.response && statsData.response.length === 2) {
        // Mapeie o ID do time da API para o valor correspondente do seu mapeamento
        const idTime1 = idMapping[statsData.response[0].team.id] || null; // Time 1
        const idTime2 = idMapping[statsData.response[1].team.id] || null; // Time 2
  
        // Mapeie as estatísticas para ambos os times
        const statsTime1 = statsData.response[0].statistics[0];
        const statsTime2 = statsData.response[1].statistics[0];
        // Consulta SQL para inserir os dados na tabela statstime
        const query = `
          INSERT INTO statstime (idPartida, idTime, pontos, assistencias, fgm, fga, fgp, ftm, fta, ftp, tpm, tpa, tpp, offReb, defReb, totReb, pFouls, steals, turnovers, blocks, plusMinus)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
  
        // Execute a consulta com os dados das estatísticas para ambos os times
        await db.query(query, [
          idPartida,
          idTime1, // Use o idTime mapeado para o Time 1
          statsTime1.points,
          statsTime1.assists,
          statsTime1.fgm,
          statsTime1.fga,
          statsTime1.fgp,
          statsTime1.ftm,
          statsTime1.fta,
          statsTime1.ftp,
          statsTime1.tpm,
          statsTime1.tpa,
          statsTime1.tpp,
          statsTime1.offReb,
          statsTime1.defReb,
          statsTime1.totReb,
          statsTime1.pFouls,
          statsTime1.steals,
          statsTime1.turnovers,
          statsTime1.blocks,
          statsTime1.plusMinus
        ]);
  
        await db.query(query, [
          idPartida,
          idTime2, // Use o idTime mapeado para o Time 2
          // Mapeie as estatísticas para o Time 2 da mesma forma
          statsTime2.points,
          statsTime2.assists,
          statsTime2.fgm,
          statsTime2.fga,
          statsTime2.fgp,
          statsTime2.ftm,
          statsTime2.fta,
          statsTime2.ftp,
          statsTime2.tpm,
          statsTime2.tpa,
          statsTime2.tpp,
          statsTime2.offReb,
          statsTime2.defReb,
          statsTime2.totReb,
          statsTime2.pFouls,
          statsTime2.steals,
          statsTime2.turnovers,
          statsTime2.blocks,
          statsTime2.plusMinus
        ]);
  
        console.log(`Estatísticas da partida ${idPartida} salvas com sucesso para ambos os times.`);
      } else {
        console.error(`A resposta da API não contém dados válidos para a partida ${idPartida}.`);
      }
    } catch (error) {
      console.error(`Erro ao buscar ou salvar estatísticas da partida ${idPartida}:`, error);
    }
  }


async function getPastGamesIds() {
  try {
    const today = new Date(); // Obtém a data de hoje

    // Consulta SQL para buscar os idPartida das partidas que ocorreram antes do dia de hoje
    const query = `
      SELECT idPartida
      FROM partidas p
      WHERE date < ?
        AND NOT EXISTS (
          SELECT 1
          FROM statstime s
          WHERE s.idPartida = p.idPartida
        );
    `;


    // Execute a consulta e obtenha os idPartida das partidas passadas
    const rows = await db.query(query, [today]);

    // Mapeie os resultados para um array de ids
    const gameIds = rows.map(row => row.idPartida);

    return gameIds;
  } catch (error) {
    throw error;
  }
}

// Função para buscar e salvar estatísticas de todas as partidas passadas
async function fetchAndSaveStatsForMultipleGames() {
  try {
    const ids = await getPastGamesIds();

    for (const idPartida of ids) {
      await fetchAndSaveStatsForBothTeams(idPartida);
    }
    console.log('Estatísticas de todas as partidas passadas foram salvas com sucesso.');
  } catch (error) {
    throw error;
  }
}

// Use a função getPastGamesIds para obter os idPartida das partidas passadas

    // Use a função fetchAndSaveStatsForMultipleGames para buscar e salvar estatísticas para esses idPartida
fetchAndSaveStatsForMultipleGames()
  .then(() => {
    console.log('Estatísticas de todas as partidas passadas foram salvas com sucesso.');
  })
  .catch(error => {
    console.error('Erro ao buscar e salvar estatísticas:', error);
  });


  module.exports = {fetchAndSaveStatsForMultipleGames}