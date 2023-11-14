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


// Função para buscar e salvar estatísticas dos jogadores para uma partida
async function fetchAndSavePlayerStats(idPartida) {
  const options = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/players/statistics',
    params: { game: idPartida },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // Substitua pelo seu RapidAPI Key
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST // Substitua pelo seu RapidAPI Host
    }
  };

  try {
    const response = await axios.request(options);
    const playerStatsData = response.data;
    console.log(playerStatsData.player);
    // Certifique-se de que a resposta contenha informações sobre os jogadores
    if (playerStatsData.response && playerStatsData.response.length > 0) {
      const playerStats = playerStatsData.response;

      // Consulta SQL para inserir os dados na tabela de estatísticas dos jogadores
      const query = `
        INSERT INTO statsjogador (idPartida, idJogador, idTime, pontos, assistencias, fgm, fga, fgp, ftm, fta, ftp, tpm, tpa, tpp, offReb, defReb, totReb, pFouls, steals, turnovers, blocks, plusMinus, minutos )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      for (const playerStat of playerStats) {
        const idJogador = playerStat.player.id;
        const idTime = idMapping[playerStat.team.id];
        const points = playerStat.points;
        const assists = playerStat.assists;
        const fgm = playerStat.fgm;
        const fga = playerStat.fga;
        const fgp = playerStat.fgp;
        const ftm = playerStat.ftm;
        const fta = playerStat.fta;
        const ftp = playerStat.ftp;
        const tpm = playerStat.tpm;
        const tpa = playerStat.tpa;
        const tpp = playerStat.tpp;
        const offReb = playerStat.offReb;
        const defReb = playerStat.defReb;
        const totReb = playerStat.totReb;
        const pFouls = playerStat.pFouls;
        const steals = playerStat.steals;
        const turnovers = playerStat.turnovers;
        const blocks = playerStat.blocks;
        const plusMinus = playerStat.plusMinus;
        const minutos = playerStat.min;
	

        // Execute a consulta com os dados das estatísticas do jogador
        await db.query(query, [idPartida, idJogador, idTime, points, assists, fgm, fga, fgp, ftm, fta, ftp, tpm, tpa, tpp, offReb, defReb, totReb, pFouls, steals, turnovers, blocks, plusMinus, minutos ]);

        console.log(`Estatísticas do jogador ${idJogador} na partida ${idPartida} foram salvas com sucesso.`);
      }
    } else {
      console.error(`A resposta da API não contém dados válidos de estatísticas dos jogadores para a partida ${idPartida}.`);
    }
  } catch (error) {
    console.error(`Erro ao buscar ou salvar estatísticas dos jogadores da partida ${idPartida}:`, error);
  }
}


// Função para obter os idPartida das partidas que já ocorreram
async function getPastGameIds() {
  try {
    const today = new Date(); // Obtém a data de hoje

    // Consulta SQL para buscar os idPartida das partidas que ocorreram antes do dia de hoje
    const query = `
      SELECT idPartida
      FROM statstime st
      WHERE NOT EXISTS (
        SELECT 1
        FROM statsjogador s
        WHERE s.idPartida = st.idPartida
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

// Função para buscar e salvar estatísticas de todos os jogadores para partidas passadas
async function fetchAndSavePlayerStatsForPastGames() {
  try {
    // Use a função getPastGameIds para obter os idPartida das partidas passadas
    const gameIds = await getPastGameIds();

    // Itere sobre a lista de idPartida e execute a função fetchAndSavePlayerStats para cada um
    for (const idPartida of gameIds) {
      await fetchAndSavePlayerStats(idPartida);
    }

    console.log('Estatísticas de jogadores de todas as partidas passadas foram salvas com sucesso.');
  } catch (error) {
    throw error;
  }
}

// Execute a função fetchAndSavePlayerStatsForPastGames para buscar e salvar estatísticas de jogadores
fetchAndSavePlayerStatsForPastGames()
  .then(() => {
    console.log('Estatísticas de jogadores de todas as partidas passadas foram salvas com sucesso.');
  })
  .catch(error => {
    console.error('Erro ao buscar e salvar estatísticas de jogadores:', error);
  });