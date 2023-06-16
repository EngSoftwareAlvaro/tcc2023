const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
const apiClient = require('../src/config/api.js');

const headers = apiClient.headers;

describe('Integração API - Jogadores', () => {
  it('Deve retornar jogadores da API', async () => {
    const response = await axios.get('https://api-nba-v1.p.rapidapi.com/players', {
      headers: {
        'x-rapidapi-key': headers['x-rapidapi-key'],
        'x-rapidapi-host': headers['x-rapidapi-host']
      }
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.be.an('array');

    const players = response.data;
    expect(players).to.have.lengthOf.at.least(1);
    expect(players[0]).to.have.property('name');
    expect(players[0]).to.have.property('team');
    expect(players[0].name).to.be.a('string').that.is.not.empty;
    expect(players[0].team).to.be.a('string').that.is.not.empty;

    const playerIds = players.map(player => player.id);
    expect(playerIds).to.have.lengthOf(new Set(playerIds).size);
  });
});

describe('Integração API - Times', () => {
  it('Deve retornar times da API', async () => {
    const response = await axios.get('https://api-nba-v1.p.rapidapi.com/teams', {
      headers: {
        'x-rapidapi-key': headers['x-rapidapi-key'],
        'x-rapidapi-host': headers['x-rapidapi-host']
      }
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.be.an('array');

    const teams = response.data;
    expect(teams).to.have.lengthOf.at.least(1);
    expect(teams[0]).to.have.property('name');
    expect(teams[0]).to.have.property('city');
    expect(teams[0].name).to.be.a('string').that.is.not.empty;
    expect(teams[0].city).to.be.a('string').that.is.not.empty;

    const teamIds = teams.map(team => team.id);
    expect(teamIds).to.have.lengthOf(new Set(teamIds).size);
  });
});

describe('Integração API - Partidas', () => {
  it('Deve retornar partidas da API', async () => {
    const response = await axios.get('https://api-nba-v1.p.rapidapi.com/games', {
      headers: {
        'x-rapidapi-key': headers['x-rapidapi-key'],
        'x-rapidapi-host': headers['x-rapidapi-host']
      }
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.be.an('array');

    const games = response.data;
    expect(games).to.have.lengthOf.at.least(1);
    expect(games[0]).to.have.property('local');
    expect(games[0]).to.have.property('date');
    expect(games[0]).to.have.property('time');
    expect(games[0]).to.have.property('home_team');
    expect(games[0]).to.have.property('away_team');
    expect(games[0].local).to.be.a('string').that.is.not.empty;
    expect(games[0].date).to.be.a('string').that.is.not.empty;
    expect(games[0].time).to.be.a('string').that.is.not.empty;
    expect(games[0].home_team).to.be.a('string').that.is.not.empty;
    expect(games[0].away_team).to.be.a('string').that.is.not.empty;

    const gameIds = games.map(game => game.id);
    expect(gameIds).to.have.lengthOf(new Set(gameIds).size);
  });
});
