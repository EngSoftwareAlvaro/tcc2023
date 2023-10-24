const axios = require('axios');
const db = require('../config/db');

// Função para buscar e salvar informações de um jogador na tabela jogadores
async function fetchAndSavePlayerInfo(idJogador, idTime) {
  const options = {
    method: 'GET',
    url: 'https://api-nba-v1.p.rapidapi.com/players',
    params: { id: idJogador },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, // Substitua pelo seu RapidAPI Key
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST // Substitua pelo seu RapidAPI Host
    }
  };

  try {
    const response = await axios.request(options);
    const playerInfo = response.data;

    // Certifique-se de que a resposta contenha informações válidas do jogador
    if (playerInfo.response) {
        const playerData = playerInfo.response;
      
        // Supondo que você queira acessar o primeiro objeto no array
        const firstPlayer = playerData[0];
        
        // Consulta SQL para inserir os dados na tabela de jogadores
        const query = `
          INSERT INTO jogador (idJogador, idTime, nome, sobrenome, altura, peso, dataNascimento, naturalidade, posicao, camisa, primeiraTemp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
      
        // Verifique se os campos existem antes de inserir na consulta
        await db.query(query, [
          idJogador,
          idTime,
          firstPlayer.firstname,
          firstPlayer.lastname,
          firstPlayer.height.meters,
          firstPlayer.weight.kilograms,
          firstPlayer.birth.date,
          firstPlayer.birth.country,
          firstPlayer.leagues.standard.pos,
          firstPlayer.leagues.standard.jersey,
          firstPlayer.nba.start
        ]);
      

      console.log(`Informações do jogador ${idJogador} foram salvas com sucesso.`);
    } else {
      console.error(`A resposta da API não contém dados válidos do jogador com ID ${idJogador}.`);
    }
  } catch (error) {
    console.error(`Erro ao buscar ou salvar informações do jogador com ID ${idJogador}:`, error);
  }
}

// Função para obter todos os idJogador da tabela playerstats
async function getAllPlayerIds() {
  try {
    // Consulta SQL para obter idJogador e idTime da tabela playerstats
    const query = 'SELECT DISTINCT idJogador, idTime FROM statsjogador';

    // Execute a consulta e obtenha os idJogador
    const rows = await db.query(query);

    // Mapeie os resultados para um array de objetos contendo idJogador e idTime
    const playerIds = rows.map(row => ({
      idJogador: row.idJogador,
      idTime: row.idTime
    }));

    return playerIds;
  } catch (error) {
    throw error;
  }
}

// Função para buscar e salvar informações de todos os jogadores da tabela playerstats
async function fetchAndSavePlayerInfoForAllPlayers() {
  try {
    // Use a função getAllPlayerIds para obter todos os idJogador da tabela playerstats
    const playerIds = await getAllPlayerIds();

    // Itere sobre a lista de idJogador e execute a função fetchAndSavePlayerInfo para cada um
    for (const idJogador of playerIds) {
      await fetchAndSavePlayerInfo(idJogador.idJogador, idJogador.idTime);
    }

    console.log('Informações de todos os jogadores foram salvas com sucesso.');
  } catch (error) {
    throw error;
  }
}

// Execute a função fetchAndSavePlayerInfoForAllPlayers para buscar e salvar informações de todos os jogadores
fetchAndSavePlayerInfoForAllPlayers()
  .then(() => {
    console.log('Informações de todos os jogadores foram salvas com sucesso.');
  })
  .catch(error => {
    console.error('Erro ao buscar e salvar informações de jogadores:', error);
  });