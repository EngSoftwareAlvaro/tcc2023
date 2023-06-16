const chai = require('chai');
const expect = chai.expect;

const Jogador = require('../src/controllers/jogador');

describe('Jogador', () => {
  it('Deve criar um novo jogador', () => {
    const jogador = new Jogador(1, 'João', 1.85, 25, 'Atacante', 1);
    expect(jogador).to.be.an.instanceOf(Jogador);
    expect(jogador.id).to.equal(1);
    expect(jogador.nome).to.equal('João');
    expect(jogador.altura).to.equal(1.85);
    expect(jogador.idade).to.equal(25);
    expect(jogador.posicao).to.equal('Atacante');
    expect(jogador.idStatsJogadores).to.equal(1);
  });
});
