const db = require('../config/db');

async function fazerPrognostico(jogador) {
  // Recupera as 5 últimas partidas do jogador
  const ultimas5Partidas = await db.query(
    `SELECT *
    FROM statsjogador
    WHERE idJogador = ?
    ORDER BY idstatsjogador DESC
    LIMIT 5`,
    [jogador.idJogador]
  );

  // Calcula a média das últimas 5 partidas
  const mediaUltimas5Partidas = calcularMedia(ultimas5Partidas);

  // Calcula a média geral do jogador usando uma única consulta SQL
  const mediaQuery = `
  SELECT
    AVG(totReb) AS mediaTotReb,
    AVG(assistencias) AS mediaAssists,
    AVG(pontos) AS mediaPontos
  FROM statsJogador
  WHERE idJogador = ?
`;

  const mediaGeral = await db.query(mediaQuery, [jogador.idJogador]);
  const mediaGeralPontos = mediaGeral[0].mediaPontos;
  const mediaGeralRebotes = mediaGeral[0].mediaTotReb;
  const mediaGeralAssistencias = mediaGeral[0].mediaAssists;
    
  // Calcula o percentual de diferença entre as médias
  const percentualDiferencaPontos = (mediaUltimas5Partidas.pontos - mediaGeralPontos) / mediaGeralPontos;
  const percentualDiferencaRebotes = (mediaUltimas5Partidas.rebotes - mediaGeralRebotes) / mediaGeralRebotes;
  const percentualDiferencaAssistencias = (mediaUltimas5Partidas.assistencias - mediaGeralAssistencias) / mediaGeralAssistencias;

  // Calcula os prognósticos
  const prognosticoPontos = Math.round(mediaUltimas5Partidas.pontos * (1 + percentualDiferencaPontos));
  const prognosticoRebotes = Math.round(mediaUltimas5Partidas.rebotes * (1 + percentualDiferencaRebotes));
  const prognosticoAssistencias = Math.round(mediaUltimas5Partidas.assistencias * (1 + percentualDiferencaAssistencias));

  // Retorna os prognósticos
  return {
    pontos: prognosticoPontos,
    rebotes: prognosticoRebotes,
    assistencias: prognosticoAssistencias,
  };
}

function calcularMedia(partidas) {
  if (partidas.length === 0) {
    return {
      pontos: 0,
      rebotes: 0,
      assistencias: 0,
    };
  }

  const totalPontos = partidas.reduce((acc, partida) => acc + partida.pontos, 0);
  const totalRebotes = partidas.reduce((acc, partida) => acc + partida.totReb, 0);
  const totalAssistencias = partidas.reduce((acc, partida) => acc + partida.assistencias, 0);

  const mediaPontos = totalPontos / partidas.length;
  const mediaRebotes = totalRebotes / partidas.length;
  const mediaAssistencias = totalAssistencias / partidas.length;

  return {
    pontos: mediaPontos,
    rebotes: mediaRebotes,
    assistencias: mediaAssistencias,
  };
}

module.exports = { fazerPrognostico };
