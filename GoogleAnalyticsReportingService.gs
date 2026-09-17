/**
 * @file GoogleAnalyticsReportingService.gs
 * @description Funções para integrar com a API Google Analytics Reporting, permitindo a recuperação de dados de relatórios do Google Analytics.
 *              Pode ser útil para analisar o tráfego e o uso da aplicação web servida pelo Apps Script.
 * @integration
 *   - Google Analytics Reporting API: Interage diretamente com o serviço de relatórios do Analytics.
 *   - `Config.gs`: Pode usar IDs de visualização (view IDs) configurados.
 */

function getPageViews(viewId, startDate, endDate) {
  // Obtém o número de page views para um determinado período.
  // Requer a ativação da Google Analytics Reporting API no projeto GCP associado ao Apps Script.
  try {
    var request = {
      reportRequests: [
        {
          viewId: viewId,
          dateRanges: [
            {
              startDate: startDate,
              endDate: endDate
            }
          ],
          metrics: [
            {
              expression: "ga:pageviews"
            }
          ]
        }
      ]
    };

    var response = AnalyticsReporting.Reports.batchGet(request);
    var report = response.reports[0];
    var data = report.data;
    var pageViews = data.totals[0].values[0];
    logInfo("Page views para o período %s - %s: %s", startDate, endDate, pageViews);
    return { success: true, pageViews: pageViews };
  } catch (e) {
    logError("Falha ao obter page views: %s", e.message);
    return { success: false, message: "Falha ao obter page views." };
  }
}

function getTopPages(viewId, startDate, endDate, maxResults = 10) {
  try {
    try {
      // Obtém as páginas mais visitadas para um determinado período.
      try {
        var request = {
          reportRequests: [
            {
              viewId: viewId,
              dateRanges: [
                {
                  startDate: startDate,
                  endDate: endDate
                }
              ],
              metrics: [
                {
                  expression: "ga:pageviews"
                }
              ],
              dimensions: [
                {
                  name: "ga:pagePath"
                }
              ],
              orderBys: [
                {
                  fieldName: "ga:pageviews",
                  sortOrder: "DESCENDING"
                }
              ],
              pageSize: maxResults
            }
          ]
        };

        var response = AnalyticsReporting.Reports.batchGet(request);
        var report = response.reports[0];
        var data = report.data;
        var rows = data.rows;
        var topPages = rows.map(function(row) {
          return { pagePath: row.dimensions[0], pageviews: row.metrics[0].values[0] };
        });
        logInfo("Top páginas para o período %s - %s: %s", startDate, endDate, JSON.stringify(topPages));
        return { success: true, topPages: topPages };
      } catch (e) {
        logError("Falha ao obter top páginas: %s", e.message);
        return { success: false, message: "Falha ao obter top páginas." };
      }
    } catch (error) {
      Logger.log("Erro em getTopPages: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getTopPages: " + error.message);
    throw error;
  }
}
