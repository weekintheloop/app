/**
 * @file ChartService.gs
 * @description Prepara e formata dados para a criação de gráficos e visualizações no frontend.
 *              Abstrai a complexidade da estrutura de dados necessária para bibliotecas de gráficos (ex: Chart.js).
 * @integration
 *   - `DataService.gs`: Utiliza para buscar os dados fisiológicos.
 *   - `DashboardService.gs`: Pode ser usado para obter dados agregados.
 */

function getEegChartData(userId) {
  try {
    // Retorna dados formatados para um gráfico de EEG (alfa e teta)
    var allData = DataService.getPhysiologicalDataByUserId(userId);
    var labels = allData.map(function(record) { return record.timestamp; });
    var eegAlphaData = allData.map(function(record) { return record.eegAlpha; });
    var eegThetaData = allData.map(function(record) { return record.eegTheta; });

    return {
      labels: labels,
      datasets: [
        { label: 'EEG Alpha', data: eegAlphaData, borderColor: 'red' },
        { label: 'EEG Theta', data: eegThetaData, borderColor: 'blue' }
      ]
    };
  } catch (error) {
    Logger.log("Erro em getEegChartData: " + error.message);
    throw error;
  }
}

function getRmssdChartData(userId) {
  try {
    // Retorna dados formatados para um gráfico de RMSSD
    var allData = DataService.getPhysiologicalDataByUserId(userId);
    var labels = allData.map(function(record) { return record.timestamp; });
    var rmssdData = allData.map(function(record) { return record.rmssd; });

    return {
      labels: labels,
      datasets: [
        { label: 'RMSSD', data: rmssdData, borderColor: 'green' }
      ]
    };
  } catch (error) {
    Logger.log("Erro em getRmssdChartData: " + error.message);
    throw error;
  }
}

function getDashboardChartConfigs(userId) {
  return {
    eegChart: getEegChartData(userId),
    rmssdChart: getRmssdChartData(userId)
  };
}

