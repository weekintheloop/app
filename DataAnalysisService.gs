/**
 * @file DataAnalysisService.gs
 * @description Fornece funções para realizar análises estatísticas básicas e processamento de dados fisiológicos.
 *              Pode ser usado para calcular médias, desvios padrão, correlações, etc., antes de enviar para o Google Colab para análises mais complexas.
 * @integration
 *   - `DataService.gs`: Utiliza para buscar os dados fisiológicos brutos.
 *   - `DataAggregatorService.gs`: Pode usar dados agregados para análises.
 *   - `ReportService.gs`: Fornece resultados de análise para relatórios.
 *   - `Google Colab (Python)`: Prepara dados para análise mais aprofundada.
 */

function calculateMean(dataArray) {
  try {
    if (!dataArray || dataArray.length === 0) return 0;
    var sum = dataArray.reduce((a, b) => a + b, 0);
    return sum / dataArray.length;
  } catch (error) {
    Logger.log("Erro em calculateMean: " + error.message);
    throw error;
  }
}

function calculateStandardDeviation(dataArray) {
  try {
    if (!dataArray || dataArray.length < 2) return 0;
    var mean = calculateMean(dataArray);
    var variance = dataArray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (dataArray.length - 1);
    return Math.sqrt(variance);
  } catch (error) {
    Logger.log("Erro em calculateStandardDeviation: " + error.message);
    throw error;
  }
}

function getStatisticalSummary(userId, metric) {
  try {
    // Retorna um resumo estatístico (média, desvio padrão) para uma métrica específica de um usuário.
    var physiologicalData = DataService.getPhysiologicalDataByUserId(userId);
    var metricValues = physiologicalData.map(record => record[metric]).filter(val => typeof val === 'number');

    return {
      mean: calculateMean(metricValues),
      stdDev: calculateStandardDeviation(metricValues),
      count: metricValues.length
    };
  } catch (error) {
    Logger.log("Erro em getStatisticalSummary: " + error.message);
    throw error;
  }
}

function compareGroups(groupAData, groupBData) {
  try {
    var groupA = validateStatisticalSample_(groupAData, 'grupo A');
    var groupB = validateStatisticalSample_(groupBData, 'grupo B');
    var meanA = calculateMean(groupA);
    var meanB = calculateMean(groupB);
    var stdDevA = calculateStandardDeviation(groupA);
    var stdDevB = calculateStandardDeviation(groupB);
    var varianceA = Math.pow(stdDevA, 2);
    var varianceB = Math.pow(stdDevB, 2);
    var meanDifference = meanA - meanB;
    var standardErrorSquared = varianceA / groupA.length + varianceB / groupB.length;
    var standardError = Math.sqrt(standardErrorSquared);

    var welchT = standardError === 0
      ? (meanDifference === 0 ? 0 : null)
      : meanDifference / standardError;
    var degreesDenominator =
      Math.pow(varianceA / groupA.length, 2) / (groupA.length - 1) +
      Math.pow(varianceB / groupB.length, 2) / (groupB.length - 1);
    var degreesOfFreedom = degreesDenominator === 0
      ? null
      : Math.pow(standardErrorSquared, 2) / degreesDenominator;

    var pooledVariance = (
      (groupA.length - 1) * varianceA +
      (groupB.length - 1) * varianceB
    ) / (groupA.length + groupB.length - 2);
    var cohenD = pooledVariance === 0
      ? (meanDifference === 0 ? 0 : null)
      : meanDifference / Math.sqrt(pooledVariance);

    return {
      groupA: { count: groupA.length, mean: meanA, stdDev: stdDevA },
      groupB: { count: groupB.length, mean: meanB, stdDev: stdDevB },
      meanDifference: meanDifference,
      standardError: standardError,
      welchT: welchT,
      degreesOfFreedom: degreesOfFreedom,
      cohenD: cohenD
    };
  } catch (error) {
    Logger.log("Erro em compareGroups: " + error.message);
    throw error;
  }
}

function validateStatisticalSample_(values, label) {
  if (!Array.isArray(values) || values.length < 2) {
    throw new Error(label + ' deve conter ao menos dois valores numéricos.');
  }
  return values.map(function (value) {
    if (typeof value !== 'number' || !isFinite(value)) {
      throw new Error(label + ' contém um valor inválido.');
    }
    return value;
  });
}
