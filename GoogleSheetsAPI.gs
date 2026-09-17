/**
 * @file GoogleSheetsAPI.gs
 * @description Funções para interagir com a API avançada do Google Sheets, permitindo operações mais complexas como formatação, manipulação de células e ranges específicos, e uso de requisições em lote.
 *              Complementa o `SheetService.gs` para cenários que exigem controle mais granular.
 * @integration
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID.
 *   - `SheetService.gs`: Pode ser usado em conjunto para operações de alto e baixo nível.
 */

function batchUpdateSheet(spreadsheetId, requests) {
  try {
    // Executa um conjunto de requisições de atualização em lote na planilha.
    // Útil para otimizar o desempenho ao fazer múltiplas alterações.
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var response = Sheets.Spreadsheets.batchUpdate({
      requests: requests
    }, spreadsheetId);
    logInfo("Batch update response: %s", JSON.stringify(response));
    return response;
  } catch (error) {
    Logger.log("Erro em batchUpdateSheet: " + error.message);
    throw error;
  }
}

function formatRange(spreadsheetId, sheetName, rangeA1, formatSettings) {
  try {
    // Aplica formatação a um range específico na planilha.
    // Ex: formatSettings = { backgroundColor: { red: 1, green: 0, blue: 0 } }
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    var range = sheet.getRange(rangeA1);
    // Exemplo: range.setBackground(formatSettings.backgroundColor);
    logInfo("Range %s formatado na aba %s.", rangeA1, sheetName);
  } catch (error) {
    Logger.log("Erro em formatRange: " + error.message);
    throw error;
  }
}

function getNamedRange(spreadsheetId, namedRangeName) {
  try {
    try {
      // Obtém os valores de um range nomeado na planilha.
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var namedRange = spreadsheet.getRangeByName(namedRangeName);
      if (namedRange) {
        return namedRange.getValues();
      }
      return null;
    } catch (error) {
      Logger.log("Erro em getNamedRange: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getNamedRange: " + error.message);
    throw error;
  }
}
