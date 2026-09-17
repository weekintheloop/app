/**
 * @file SheetService.gs
 * @description Fornece funções de baixo nível para interagir com o Google Sheet, realizando operações CRUD genéricas (leitura, escrita, atualização e exclusão de linhas).
 *              Este serviço é agnóstico ao tipo de dado, operando em linhas e colunas.
 * @integration
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID para identificar a planilha alvo.
 *   - Outros serviços (.gs): Utilizado por `AuthService.gs`, `UserService.gs`, `DataService.gs` para persistência de dados.
 */

function getSheetById(sheetId, sheetName) {
  try {
    if (!sheetId) {
      var missingIdError = new Error('spreadsheetId é obrigatório para acessar a aba.');
      logError('SheetService.getSheetById: spreadsheetId ausente.', missingIdError);
      throw missingIdError;
    }
    if (!sheetName || !String(sheetName).trim()) {
      var missingNameError = new Error('sheetName é obrigatório para acessar a aba.');
      logError('SheetService.getSheetById: sheetName ausente.', missingNameError);
      throw missingNameError;
    }

    try {
      var spreadsheet = SpreadsheetApp.openById(sheetId);
      var sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet) return sheet;

      sheet = spreadsheet.insertSheet(sheetName);
      logInfo('SheetService.getSheetById: aba criada ', sheetName);
      return sheet;
    } catch (error) {
      logError('SheetService.getSheetById: falha ao acessar ou criar aba ' + sheetName, error);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getSheetById: " + error.message);
    throw error;
  }
}

function tryGetSheetById(sheetId, sheetName) {
  try {
    return StandardReturn.ok(getSheetById(sheetId, sheetName));
  } catch (error) {
    return StandardReturn.fail(error);
  }
}

function getAllRows(sheetId, sheetName) {
  try {
    try {
      var sheet = getSheetById(sheetId, sheetName);
      if (!sheet || sheet.getLastRow() < 1) return [];

      var values = sheet.getDataRange().getValues();
      if (values.length < 2) return [];

      var headers = values[0].map(function(header) { return String(header); });
      return values.slice(1)
          .filter(function(row) {
            return isMeaningfulDataRow_(row, headers);
          })
          .map(function(row, rowOffset) {
            var item = { rowIndex: rowOffset + 2 };
            headers.forEach(function(header, index) {
              item[header] = row[index];
            });
            return item;
          });
    } catch (error) {
      Logger.log("Erro em getAllRows: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getAllRows: " + error.message);
    throw error;
  }
}

function isBlankSheetCell_(cell) {
  return cell === '' || cell === null || typeof cell === 'undefined';
}

function findIdentifierHeaderIndex_(headers) {
  try {
    var normalizedIdentifiers = {
      id: true,
      uuid: true,
      userid: true,
      user_id: true,
      recordid: true,
      record_id: true
    };

    for (var i = 0; i < headers.length; i++) {
      var normalized = String(headers[i] || '').trim().toLowerCase().replace(/[^a-z0-9_]+/g, '');
      if (normalizedIdentifiers[normalized]) return i;
    }
    return -1;
  } catch (error) {
    Logger.log("Erro em findIdentifierHeaderIndex_: " + error.message);
    throw error;
  }
}

function isMeaningfulDataRow_(row, headers) {
  var headerCount = headers.length;
  var identifierIndex = findIdentifierHeaderIndex_(headers);
  if (identifierIndex >= 0 && !isBlankSheetCell_(row[identifierIndex])) return true;

  for (var i = 0; i < headerCount; i++) {
    if (!isBlankSheetCell_(row[i])) return true;
  }
  return false;
}

function withSheetWriteLock_(context, callback) {
  try {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
      return callback();
    } catch (error) {
      logError('SheetService.' + context + ': falha em escrita protegida por lock.', error);
      throw error;
    } finally {
      try {
        lock.releaseLock();
      } catch (releaseError) {
        logError('SheetService.' + context + ': falha ao liberar lock.', releaseError);
      }
    }
  } catch (error) {
    Logger.log("Erro em withSheetWriteLock_: " + error.message);
    throw error;
  }
}

function appendRow(sheetId, sheetName, rowData) {
  return withSheetWriteLock_('appendRow', function() {
    var sheet = getSheetById(sheetId, sheetName);
    if (!sheet) return null;

    var headers = ensureSheetHeaders_(sheet, rowData);
    sheet.appendRow(headers.map(function(header) {
      return typeof rowData[header] === 'undefined' ? '' : rowData[header];
    }));
    return rowData;
  });
}

function updateRow(sheetId, sheetName, rowIndex, rowData) {
  try {
    try {
      return withSheetWriteLock_('updateRow', function() {
        var sheet = getSheetById(sheetId, sheetName);
        if (!sheet || !rowIndex) return null;

        var headers = ensureSheetHeaders_(sheet, rowData);
        var currentValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
        var nextValues = headers.map(function(header, index) {
          return typeof rowData[header] === 'undefined' ? currentValues[index] : rowData[header];
        });

        sheet.getRange(rowIndex, 1, 1, nextValues.length).setValues([nextValues]);
        return rowData;
      });
    } catch (error) {
      Logger.log("Erro em updateRow: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em updateRow: " + error.message);
    throw error;
  }
}

function deleteRow(sheetId, sheetName, rowIndex) {
  try {
    try {
      return withSheetWriteLock_('deleteRow', function() {
        var sheet = getSheetById(sheetId, sheetName);
        if (!sheet || !rowIndex || rowIndex < 2) return false;
        sheet.deleteRow(rowIndex);
        return true;
      });
    } catch (error) {
      Logger.log("Erro em deleteRow: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em deleteRow: " + error.message);
    throw error;
  }
}

function findRowByColumnValue(sheetId, sheetName, columnName, value) {
  var rows = getAllRows(sheetId, sheetName);
  return rows.find(function(row) {
    return String(row[columnName]) === String(value);
  }) || null;
}

function findRowsByColumnValue(sheetId, sheetName, columnName, value) {
  try {
    return getAllRows(sheetId, sheetName).filter(function(row) {
      return String(row[columnName]) === String(value);
    });
  } catch (error) {
    Logger.log("Erro em findRowsByColumnValue: " + error.message);
    throw error;
  }
}

function ensureSheetHeaders_(sheet, rowData) {
  try {
    try {
      try {
        var newHeaders = Object.keys(rowData || {});
        if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
          sheet.appendRow(newHeaders);
          return newHeaders;
        }

        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
            .map(function(header) { return String(header); });
        var missingHeaders = newHeaders.filter(function(header) {
          return headers.indexOf(header) === -1;
        });

        if (missingHeaders.length > 0) {
          sheet.getRange(1, headers.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
          headers = headers.concat(missingHeaders);
        }

        return headers;
      } catch (error) {
        Logger.log("Erro em ensureSheetHeaders_: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em ensureSheetHeaders_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em ensureSheetHeaders_: " + error.message);
    throw error;
  }
}
