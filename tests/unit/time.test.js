const chai = require('chai');
const expect = chai.expect;

const Time = require('../src/controllers/time');

describe('Time', () => {
  it('Deve criar um novo time', () => {
    const time = new Time(1, 'Time A', 'Cidade A', 'Estado A', 'Conferência A', 'Ginásio A', 1, 1);
    expect(time).to.be.an.instanceOf(Time);
    expect(time.id).to.equal(1);
    expect(time.nome).to.equal('Time A');
    expect(time.cidade).to.equal('Cidade A');
    expect(time.estado).to.equal('Estado A');
    expect(time.conferencia).to.equal('Conferência A');
    expect(time.ginasio).to.equal('Ginásio A');
    expect(time.idStatsTimes).to.equal(1);
    expect(time.idJogador).to.equal(1);
  });
});
