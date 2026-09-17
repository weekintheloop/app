/**
 * @file DashboardDataService.gs
 * @description Serviço especializado na preparação e agregação de dados para os widgets do dashboard.
 *              Foca em fornecer os dados de forma otimizada para exibição rápida na interface do usuário.
 * @integration
 *   - `DataService.gs`: Busca os dados fisiológicos brutos.
 *   - `DataAggregatorService.gs`: Utiliza dados agregados para resumos do dashboard.
 *   - `ChartDataService.gs`: Prepara dados para gráficos específicos do dashboard.
 *   - `Dashboard.html`: Consumido pelo frontend para popular os widgets.
 */

function getDashboardOverview(userId) {
  try {
    // Retorna um objeto com dados de visão geral para o dashboard de um usuário.
    var allData = DataService.getPhysiologicalDataByUserId(userId);
    var latestRecord = allData.length > 0 ? allData[allData.length - 1] : null;
    var aggregatedData = DataAggregatorService.aggregateDataByDay(userId);

    return {
      totalRecords: allData.length,
      lastRecordTimestamp: latestRecord ? latestRecord.Timestamp : 'N/A',
      averageEegAlpha: aggregatedData.length > 0 ? DataAnalysisService.calculateMean(aggregatedData.map(d => d.AvgEegAlpha)) : 0,
      averageRmssd: aggregatedData.length > 0 ? DataAnalysisService.calculateMean(aggregatedData.map(d => d.AvgRmssd)) : 0,
      // Adicionar outras métricas relevantes
    };
  } catch (error) {
    Logger.log("Erro em getDashboardOverview: " + error.message);
    throw error;
  }
}

function getDashboardChartConfigs(userId) {
  // Retorna configurações e dados para múltiplos gráficos a serem exibidos no dashboard.
  return {
    eegChart: ChartDataService.getChartDataForEEG(userId),
    rmssdChart: ChartDataService.getChartDataForRMSSD(userId)
  };
}
