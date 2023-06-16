const chai = require('chai');
const expect = chai.expect;

const Partida = require('../src/controllers/partida');

describe('Partida', () => {
  it('Deve criar uma nova partida', () => {
    const partida = new Partida(1, 'Local A', '2023-06-15', '20:00:00', 1, 1);
    expect(partida).to.be.an.instanceOf(Partida);
    expect(partida.id).to.equal(1);
    expect(partida.local).to.equal('Local A');
    expect(partida.data).to.equal('2023-06-15');
    expect(partida.horario).to.equal('20:00:00');
    expect(partida.idTime).to.equal(1);
    expect(partida.idPrognostico).to.equal(1);
  });
});
