/**
 * @file GoogleSheetsFormattingService.gs
 * @description Funções para aplicar formatação condicional, estilos e validação de dados em planilhas Google Sheets.
 *              Permite melhorar a legibilidade e a integridade dos dados diretamente na planilha.
 * @integration
 *   - `GoogleSheetsAPI.gs`: Pode usar para aplicar formatações em lote.
 *   - `SheetService.gs`: Interage com as abas da planilha.
 */

function applyHeaderFormatting(sheetId, sheetName) {
  try {
    // Aplica formatação padrão aos cabeçalhos de uma aba.
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (sheet) {
      var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
      headerRange.setBackground("#CCCCCC").setFontWeight("bold");
      logInfo("Formatação de cabeçalho aplicada à aba ", sheetName);
      return { success: true, message: "Formatação de cabeçalho aplicada." };
    }
    return { success: false, message: "Aba não encontrada." };
  } catch (error) {
    Logger.log("Erro em applyHeaderFormatting: " + error.message);
    throw error;
  }
}

function applyConditionalFormatting(sheetId, sheetName, rangeA1, rule) {
  try {
    // Aplica uma regra de formatação condicional a um range específico.
    // Ex: rule = SpreadsheetApp.newConditionalFormatRule().whenTextContains("erro").setBackground("red").setRange(range).build();
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (sheet) {
      var range = sheet.getRange(rangeA1);
      sheet.setConditionalFormatRules([rule]);
      logInfo("Formatação condicional aplicada ao range ", rangeA1, " na aba ", sheetName);
      return { success: true, message: "Formatação condicional aplicada." };
    }
    return { success: false, message: "Aba não encontrada." };
  } catch (error) {
    Logger.log("Erro em applyConditionalFormatting: " + error.message);
    throw error;
  }
}

function applyDataValidation(sheetId, sheetName, rangeA1, rule) {
  try {
    // Aplica uma regra de validação de dados a um range específico.
    // Ex: rule = SpreadsheetApp.newDataValidation().requireValueInList(["admin", "user"]).build();
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (sheet) {
      var range = sheet.getRange(rangeA1);
      range.setDataValidation(rule);
      logInfo("Validação de dados aplicada ao range ", rangeA1, " na aba ", sheetName);
      return { success: true, message: "Validação de dados aplicada." };
    }
    return { success: false, message: "Aba não encontrada." };
  } catch (error) {
    Logger.log("Erro em applyDataValidation: " + error.message);
    throw error;
  }
}
