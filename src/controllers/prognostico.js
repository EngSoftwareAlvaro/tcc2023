const db = require('../config/db');

async function fazerPrognostico(jogador) {
  // Recupera as 5 últimas partidas do jogador
  const ultimas5Partidas = await db.query(
    `SELECT *
    FROM statsjogador
    WHERE idJogador = ?
    ORDER BY idTime, idJogador, idPartida DESC
    LIMIT 5;`,
    [jogador.idJogador]
  );

  // Calcula a média das últimas 5 partidas
  const mediaUltimas5Partidas = calcularMedia(ultimas5Partidas);
  // console.log("////////////");
  // console.log(mediaUltimas5Partidas);

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
  const mediaGeralPontos = mediaGeral[0].mediaPontos.toFixed(1);
  const mediaGeralRebotes = mediaGeral[0].mediaTotReb.toFixed(1);
  const mediaGeralAssistencias = mediaGeral[0].mediaAssists.toFixed(1);

  // console.log("////////////");
  // console.log(mediaGeralPontos);
  // console.log("////////////");
  // console.log(mediaGeralRebotes);
  // console.log("////////////");
  // console.log(mediaGeralAssistencias);

  // Calcular a porcentagem de diferença
const { porcentagemDiferenca } = calcularPorcentagemDiferenca(
  mediaUltimas5Partidas,
  { pontos: mediaGeralPontos, rebotes: mediaGeralRebotes, assistencias: mediaGeralAssistencias }
);

// Exibir os resultados
// console.log('Porcentagem de Diferença:', porcentagemDiferenca);

// Acessar as propriedades corretas
const percentualDiferencaPontos = porcentagemDiferenca.pontos;
const percentualDiferencaRebotes = porcentagemDiferenca.rebotes;
const percentualDiferencaAssistencias = porcentagemDiferenca.assistencias;

// Exibir os percentuais de diferença
// console.log('Percentual de Diferença em Pontos:', percentualDiferencaPontos);
// console.log('Percentual de Diferença em Rebotes:', percentualDiferencaRebotes);
// console.log('Percentual de Diferença em Assistências:', percentualDiferencaAssistencias);


  // Calcula os prognósticos
  const prognosticoPontos = Math.round(mediaUltimas5Partidas.pontos * (1 + (percentualDiferencaPontos)));
  const prognosticoRebotes = Math.round(mediaUltimas5Partidas.rebotes * (1 + (percentualDiferencaRebotes)));
  const prognosticoAssistencias = Math.round(mediaUltimas5Partidas.assistencias * (1 + (percentualDiferencaAssistencias)));

  // console.log("prognostico pontos");
  // console.log(prognosticoPontos);
  // console.log("////////////");
  // console.log(prognosticoRebotes);
  // console.log("////////////");
  // console.log(prognosticoAssistencias);
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

// Função para calcular a porcentagem de diferença
function calcularPorcentagemDiferenca(mediaUltimas5, mediaGeral) {
  const diferenca = {};
  const porcentagemDiferenca = {};

  // Calcular a diferença para cada componente
  for (const componente in mediaUltimas5) {
    diferenca[componente] = mediaUltimas5[componente] - mediaGeral[componente];
  }

  // Calcular a porcentagem de diferença para cada componente
  for (const componente in diferenca) {
    porcentagemDiferenca[componente] = (diferenca[componente] / mediaGeral[componente]);


  }

  return { porcentagemDiferenca };
}



module.exports = { fazerPrognostico };
