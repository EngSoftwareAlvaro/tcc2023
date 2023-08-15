const axios = require('axios');
const db = require('../config/db');

const getAllPlayers = async () => {
    try {
        const response = await axios.get('https://api-nba-v1.p.rapidapi.com/players', {
            params: {
                team: '',
                season: '2022'
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            },
        });


        console.log(response.data); // Adicione esta linha para imprimir a resposta completa da API

        const players = response.data.response.map(player => {
            return {
                idJogador: player.id,
                idTime: 0,
                nome: player.firstname,
                sobrenome: player.lastname,
                idade: player.birth.date,
                altura: player.height.meters,
                posicao: player.leagues.standard && player.leagues.standard.pos,
                camisa: player.leagues.standard && player.leagues.standard.jersey,
            };
        });
        
        
        players.forEach(player => {
            db.insert('jogador', player);
        });

        console.log('Jogadores salvos no banco de dados com sucesso!');
    } catch (error) {
        console.error('Erro ao buscar os dados dos jogadores:', error);
    } finally {
        db.end();
    }
};

getAllPlayers();


