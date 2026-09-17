/**
 * @file SortService.gs
 * @description Fornece funcionalidades para ordenar dados de planilhas com base em uma ou mais colunas.
 *              Permite organizar conjuntos de dados para melhor visualização ou análise.
 * @integration
 *   - `SheetService.gs`: Utiliza para ler os dados da planilha.
 *   - `DataService.gs`: Pode ser usado para ordenar dados fisiológicos.
 */

function sortDataByColumn(sheetId, sheetName, columnName, ascending = true) {
  try {
    try {
      var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
      if (!sheet) {
        return [];
      }
      var data = sheet.getDataRange().getValues();
      var headers = data.shift();
      var columnIndex = headers.indexOf(columnName);

      if (columnIndex === -1) {
        logWarning("Coluna ", columnName, " não encontrada para ordenação.");
        return [];
      }

      var sortedRows = data.sort(function(rowA, rowB) {
        var valueA = rowA[columnIndex];
        var valueB = rowB[columnIndex];

        if (typeof valueA === 'string') {
          return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        } else {
          return ascending ? valueA - valueB : valueB - valueA;
        }
      });

      // Reconstroi os objetos com cabeçalhos
      return sortedRows.map(function(row) {
        var obj = {};
        headers.forEach(function(header, index) {
          obj[header] = row[index];
        });
        return obj;
      });
    } catch (error) {
      Logger.log("Erro em sortDataByColumn: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em sortDataByColumn: " + error.message);
    throw error;
  }
}

function sortPhysiologicalDataByTimestamp(ascending = true) {
  return sortDataByColumn(Config.getSpreadsheetId(), Config.getPhysiologicalDataSheetName(), "Timestamp", ascending);
}
