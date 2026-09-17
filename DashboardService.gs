/**
 * @file DashboardService.gs
 * @description Prepara e agrega dados para exibição em dashboards, fornecendo resumos e métricas chave.
 *              Abstrai a complexidade da consulta e agregação de dados brutos.
 * @integration
 *   - `DataService.gs`: Utiliza para buscar os dados fisiológicos brutos.
 *   - `UserService.gs`: Pode usar para filtrar dados por usuário.
 *   - `ChartService.gs`: Prepara dados para serem visualizados em gráficos.
 */

function getDashboardSummary(userId) {
  var allData = DataService.getPhysiologicalDataByUserId(userId) || [];
  var total = allData.length;
  var sumAlpha = 0;
  var sumRmssd = 0;
  allData.forEach(function(r) {
    sumAlpha += Number(r.eegAlpha || 0);
    sumRmssd += Number(r.rmssd || 0);
  });
  return {
    totalRecords: total,
    avgEegAlpha: total > 0 ? sumAlpha / total : 0,
    avgRmssd: total > 0 ? sumRmssd / total : 0
  };
}

function getDashboardOverview(userId) {
  var allData = DataService.getPhysiologicalDataByUserId(userId) || [];
  var total = allData.length;
  var last = total > 0 ? allData[total - 1] : null;
  var sumAlpha = 0;
  allData.forEach(function(r) {
    sumAlpha += Number(r.eegAlpha || 0);
  });
  return {
    totalRecords: total,
    lastRecordTimestamp: last ? (last.timestamp || last.Timestamp || "—") : "—",
    averageEegAlpha: total > 0 ? sumAlpha / total : 0
  };
}

function getRecentData(userId, limit) {
  try {
    var allData = DataService.getPhysiologicalDataByUserId(userId) || [];
    return allData.slice(0, limit || 10);
  } catch (error) {
    Logger.log("Erro em getRecentData: " + error.message);
    throw error;
  }
}

