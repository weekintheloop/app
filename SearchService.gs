/**
 * @file SearchService.gs
 * @description Fornece funcionalidades de busca para pesquisar dados na planilha Google Sheets.
 *              Permite aos usuários encontrar registros específicos com base em critérios de pesquisa.
 * @integration
 *   - `SheetService.gs`: Utiliza para ler os dados da planilha.
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID e os nomes das abas.
 */

function searchPhysiologicalData(query, sheetName) {
  try {
    // Realiza uma busca nos dados fisiológicos com base em uma query
    var sheet = SpreadsheetApp.openById(Config.getSpreadsheetId()).getSheetByName(sheetName);
    if (!sheet) {
      return [];
    }
    var data = sheet.getDataRange().getValues();
    var headers = data.shift(); // Remove o cabeçalho
    var results = [];

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      for (var j = 0; j < row.length; j++) {
        if (String(row[j]).toLowerCase().indexOf(query.toLowerCase()) !== -1) {
          var record = {};
          for (var k = 0; k < headers.length; k++) {
            record[headers[k]] = row[k];
          }
          results.push(record);
          break; // Encontrou na linha, passa para a próxima
        }
      }
    }
    return results;
  } catch (error) {
    Logger.log("Erro em searchPhysiologicalData: " + error.message);
    throw error;
  }
}

function searchUsers(query) {
  // Realiza uma busca nos usuários com base em uma query
  return searchPhysiologicalData(query, Config.getUsersSheetName()); // Reutiliza a função de busca genérica
}
