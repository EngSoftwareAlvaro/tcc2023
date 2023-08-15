const axios = require('axios');
const db = require('../config/db');

const getAllTeams = async () => {
    try {
        const response = await axios.get('https://api-nba-v1.p.rapidapi.com/teams', {
            params: {
                id: '',
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            },
        });


        console.log(response.data); // Adicione esta linha para imprimir a resposta completa da API

        const teams = response.data.response.map(team => {
            return {
                idTime: 0,
                nome: team.name,
                apelido: team.nickname,
                sigla: team.code,
                cidade: team.city,
                logo: team.logo,
                conferencia: team.leagues.standard.conference, 
                arena: "",
                titulos: ""
            };
        });
        
        
        teams.forEach(team => {
            db.insert('time', team);
        });

        console.log('Times salvos no banco de dados com sucesso!');
    } catch (error) {
        console.error('Erro ao buscar os dados dos times:', error);
    } finally {
        db.end();
    }
};

getAllTeams();


