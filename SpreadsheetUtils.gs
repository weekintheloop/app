/**
 * @file SpreadsheetUtils.gs
 * @description Funções utilitárias para manipulação de planilhas e abas, complementando o `SheetService.gs`.
 *              Inclui operações como criação de abas, renomear, mover e verificar a existência de abas.
 * @integration
 *   - `SheetService.gs`: Trabalha em conjunto para operações de planilha.
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID.
 */

function createSheetIfNotExist(spreadsheetId, sheetName) {
  try {
    if (!spreadsheetId) {
      var missingIdError = new Error('spreadsheetId é obrigatório para criar ou acessar a aba.');
      logError('SpreadsheetUtils.createSheetIfNotExist: spreadsheetId ausente.', missingIdError);
      throw missingIdError;
    }
    if (!sheetName || !String(sheetName).trim()) {
      var missingNameError = new Error('sheetName é obrigatório para criar ou acessar a aba.');
      logError('SpreadsheetUtils.createSheetIfNotExist: sheetName ausente.', missingNameError);
      throw missingNameError;
    }

    try {
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        logInfo("Aba ", sheetName, " criada na planilha ", spreadsheetId);
      }
      return sheet;
    } catch (error) {
      logError('SpreadsheetUtils.createSheetIfNotExist: falha ao criar ou acessar aba ' + sheetName, error);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em createSheetIfNotExist: " + error.message);
    throw error;
  }
}

function tryCreateSheetIfNotExist(spreadsheetId, sheetName) {
  try {
    return StandardReturn.ok(createSheetIfNotExist(spreadsheetId, sheetName));
  } catch (error) {
    return StandardReturn.fail(error);
  }
}

function renameSheet(spreadsheetId, oldName, newName) {
  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(oldName);
    if (sheet) {
      sheet.setName(newName);
      logInfo("Aba ", oldName, " renomeada para ", newName);
      return true;
    }
    logWarning("Aba ", oldName, " não encontrada para renomear.");
    return false;
  } catch (error) {
    Logger.log("Erro em renameSheet: " + error.message);
    throw error;
  }
}

function deleteSheetByName(spreadsheetId, sheetName) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (sheet) {
    spreadsheet.deleteSheet(sheet);
    logInfo("Aba ", sheetName, " excluída da planilha ", spreadsheetId);
    return true;
  }
  logWarning("Aba ", sheetName, " não encontrada para exclusão.");
  return false;
}
