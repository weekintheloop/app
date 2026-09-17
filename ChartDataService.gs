/**
 * @file ChartDataService.gs
 * @description Prepara e formata dados especificamente para bibliotecas de gráficos JavaScript no frontend (e.g., Chart.js).
 *              Este serviço foca na estrutura de dados necessária para visualizações, abstraindo a complexidade da API de gráficos.
 * @integration
 *   - `DataService.gs`: Utiliza para buscar os dados fisiológicos brutos.
 *   - `DataAggregatorService.gs`: Pode usar dados agregados para gráficos de resumo.
 *   - `Dashboard.html`, `ChartDisplay.html`: Consumido pelo frontend para renderizar gráficos.
 */

function getChartDataForEEG(userId) {
  try {
    // Retorna dados formatados para um gráfico de linha de EEG (Alpha e Theta)
    var physiologicalData = DataService.getPhysiologicalDataByUserId(userId);
    var labels = physiologicalData.map(record => record.Timestamp);
    var alphaData = physiologicalData.map(record => record.EEG_Alpha);
    var thetaData = physiologicalData.map(record => record.EEG_Theta);

    return {
      labels: labels,
      datasets: [
        { label: 'EEG Alpha', data: alphaData, borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)', fill: false },
        { label: 'EEG Theta', data: thetaData, borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', fill: false }
      ]
    };
  } catch (error) {
    Logger.log("Erro em getChartDataForEEG: " + error.message);
    throw error;
  }
}

function getChartDataForRMSSD(userId) {
  try {
    // Retorna dados formatados para um gráfico de linha de RMSSD
    var physiologicalData = DataService.getPhysiologicalDataByUserId(userId);
    var labels = physiologicalData.map(record => record.Timestamp);
    var rmssdData = physiologicalData.map(record => record.RMSSD);

    return {
      labels: labels,
      datasets: [
        { label: 'RMSSD', data: rmssdData, borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill: false }
      ]
    };
  } catch (error) {
    Logger.log("Erro em getChartDataForRMSSD: " + error.message);
    throw error;
  }
}

function getChartDataForPupilometry(userId) {
  try {
    // Retorna dados formatados para um gráfico de linha de Pupilometria
    var physiologicalData = DataService.getPhysiologicalDataByUserId(userId);
    var labels = physiologicalData.map(record => record.Timestamp);
    var pupilDiameterData = physiologicalData.map(record => record.PupilDiameter);

    return {
      labels: labels,
      datasets: [
        { label: 'Diâmetro Pupilar', data: pupilDiameterData, borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)', fill: false }
      ]
    };
  } catch (error) {
    Logger.log("Erro em getChartDataForPupilometry: " + error.message);
    throw error;
  }
}
