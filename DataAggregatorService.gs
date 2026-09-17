/**
 * @file DataAggregatorService.gs
 * @description Agrega e sumariza dados fisiológicos de diversas fontes ou períodos para análises de alto nível.
 *              Útil para gerar visões consolidadas ou para preparar dados para relatórios e dashboards.
 * @integration
 *   - `DataService.gs`: Utiliza para buscar os dados fisiológicos brutos.
 *   - `ReportService.gs`: Pode usar dados agregados para gerar relatórios.
 *   - `DashboardService.gs`: Fornece dados sumarizados para o dashboard.
 */

function aggregateDataByDay(userId) {
  try {
    // Agrega dados fisiológicos por dia para um usuário específico
    var allData = DataService.getPhysiologicalDataByUserId(userId);
    var aggregated = {};
    allData.forEach(function(record) {
      var date = Utilities.formatDate(new Date(record.Timestamp), Session.getScriptTimeZone(), "yyyy-MM-dd");
      if (!aggregated[date]) {
        aggregated[date] = { count: 0, totalEegAlpha: 0, totalEegTheta: 0, totalRmssd: 0, totalEda: 0 };
      }
      aggregated[date].count++;
      aggregated[date].totalEegAlpha += record.EEG_Alpha || 0;
      aggregated[date].totalEegTheta += record.EEG_Theta || 0;
      aggregated[date].totalRmssd += record.RMSSD || 0;
      aggregated[date].totalEda += record.EDA_Conductance || 0;
    });

    var result = [];
    for (var date in aggregated) {
      result.push({
        Date: date,
        AvgEegAlpha: aggregated[date].totalEegAlpha / aggregated[date].count,
        AvgEegTheta: aggregated[date].totalEegTheta / aggregated[date].count,
        AvgRmssd: aggregated[date].totalRmssd / aggregated[date].count,
        AvgEda: aggregated[date].totalEda / aggregated[date].count
      });
    }
    return result;
  } catch (error) {
    Logger.log("Erro em aggregateDataByDay: " + error.message);
    throw error;
  }
}

function getOverallAverages() {
  // Calcula médias gerais de todos os dados fisiológicos disponíveis
  // (Exemplo simplificado, precisaria de uma função para buscar TODOS os dados)
  return { avgEegAlpha: 0, avgEegTheta: 0, avgRmssd: 0, avgEda: 0 };
}
