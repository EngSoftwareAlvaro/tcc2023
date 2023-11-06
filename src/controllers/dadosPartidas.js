const axios = require('axios');
const moment = require('moment');
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

const getAllGames = async () => {
    try {
        const response = await axios.get('https://api-nba-v1.p.rapidapi.com/games', {
            params: { season: '2023' },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            },
        });

        const games = response.data.response.map(game => {
            // Converta o formato da data para 'YYYY-MM-DD' usando o Moment.js
            const formattedDate = moment(game.date.start).format('YYYY-MM-DD HH:mm:ss');

            // Verifique se os IDs das equipes estão mapeados
            if (!idMapping[game.teams.home.id] || !idMapping[game.teams.visitors.id]) {
                console.log(`Partida ignorada - IDs de equipe não mapeados: ${game.id}`);
                return null;
            }

            // Mapeie os IDs da equipe para os IDs desejados
            const homeTeamId = idMapping[game.teams.home.id];
            const visitorTeamId = idMapping[game.teams.visitors.id];

            return {
                idPartida: game.id,
                date: formattedDate,
                home: homeTeamId,
                visitor: visitorTeamId,
            };
        });

        // Filtra as partidas que não foram ignoradas
        const validGames = games.filter(game => game !== null);

        validGames.forEach(game => {
            db.insert('partidas', game);
            
        });

        console.log('Partidas salvas no banco de dados com sucesso!');
    } catch (error) {
        console.error('Erro ao buscar os dados das partidas:', error);
    } finally {
        db.end();
    }
};

getAllGames();
