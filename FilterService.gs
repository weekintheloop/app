/**
 * @file FilterService.gs
 * @description Fornece funcionalidades para filtrar dados de planilhas com base em critérios específicos.
 *              Permite refinar conjuntos de dados para análise ou exibição.
 * @integration
 *   - `SheetService.gs`: Utiliza para ler os dados da planilha.
 *   - `DataService.gs`: Pode ser usado para filtrar dados fisiológicos.
 */

function filterDataByColumn(sheetId, sheetName, columnName, filterValue) {
  try {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (!sheet) {
      return [];
    }
    var data = sheet.getDataRange().getValues();
    var headers = data.shift();
    var columnIndex = headers.indexOf(columnName);

    if (columnIndex === -1) {
      logWarning("Coluna " + columnName + " não encontrada para filtragem.");
      return [];
    }

    var filteredRows = data.filter(function(row) {
      return String(row[columnIndex]) === String(filterValue);
    });

    // Reconstroi os objetos com cabeçalhos
    return filteredRows.map(function(row) {
      var obj = {};
      headers.forEach(function(header, index) {
        obj[header] = row[index];
      });
      return obj;
    });
  } catch (error) {
    Logger.log("Erro em filterDataByColumn: " + error.message);
    throw error;
  }
}

function filterPhysiologicalDataByUserId(userId) {
  return filterDataByColumn(Config.getSpreadsheetId(), Config.getPhysiologicalDataSheetName(), "UserID", userId);
}
