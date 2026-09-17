/**
 * @file GoogleSheetsService.gs
 * @description Funções de alto nível para interagir com o Google Sheets, abstraindo a complexidade da API.
 *              Oferece uma interface mais amigável para operações comuns em planilhas.
 * @integration
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID.
 *   - `SheetService.gs`: Utiliza funções de baixo nível para operações CRUD.
 *   - `SpreadsheetUtils.gs`: Utiliza para manipulação de abas.
 */

function getSheetDataAsObjects(sheetName) {
  try {
    // Retorna os dados de uma aba como um array de objetos, onde cada objeto representa uma linha e as chaves são os cabeçalhos.
    var sheet = SpreadsheetApp.openById(Config.getSpreadsheetId()).getSheetByName(sheetName);
    if (!sheet) {
      logError("Aba ", sheetName, " não encontrada.");
      return [];
    }
    var data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      return [];
    }
    var headers = data.shift();
    var objects = [];
    data.forEach(function(row) {
      var obj = {};
      headers.forEach(function(header, index) {
        obj[header] = row[index];
      });
      objects.push(obj);
    });
    return objects;
  } catch (error) {
    Logger.log("Erro em getSheetDataAsObjects: " + error.message);
    throw error;
  }
}

function appendObjectToSheet(sheetName, objectData) {
  try {
    try {
      try {
        // Adiciona um objeto como uma nova linha na planilha, mapeando as chaves do objeto para os cabeçalhos da planilha.
        var sheet = SpreadsheetApp.openById(Config.getSpreadsheetId()).getSheetByName(sheetName);
        if (!sheet) {
          logError("Aba ", sheetName, " não encontrada para adicionar dados.");
          return false;
        }
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var row = [];
        headers.forEach(function(header) {
          row.push(objectData[header] !== undefined ? objectData[header] : "");
        });
        sheet.appendRow(row);
        return true;
      } catch (error) {
        Logger.log("Erro em appendObjectToSheet: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em appendObjectToSheet: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em appendObjectToSheet: " + error.message);
    throw error;
  }
}

function updateObjectInSheet(sheetName, keyColumn, keyValue, newObjectData) {
  try {
    try {
      try {
        // Atualiza uma linha na planilha com base em um valor de chave, mapeando as chaves do objeto para os cabeçalhos.
        var sheet = SpreadsheetApp.openById(Config.getSpreadsheetId()).getSheetByName(sheetName);
        if (!sheet) {
          logError("Aba ", sheetName, " não encontrada para atualizar dados.");
          return false;
        }
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var keyColumnIndex = headers.indexOf(keyColumn);

        if (keyColumnIndex === -1) {
          logError("Coluna chave ", keyColumn, " não encontrada na aba ", sheetName);
          return false;
        }

        for (var i = 1; i < data.length; i++) {
          if (data[i][keyColumnIndex] == keyValue) {
            var rowToUpdate = data[i];
            headers.forEach(function(header, index) {
              if (newObjectData[header] !== undefined) {
                rowToUpdate[index] = newObjectData[header];
              }
            });
            sheet.getRange(i + 1, 1, 1, rowToUpdate.length).setValues([rowToUpdate]);
            return true;
          }
        }
        logWarning("Nenhum registro encontrado com ", keyColumn, " = ", keyValue, " na aba ", sheetName);
        return false;
      } catch (error) {
        Logger.log("Erro em updateObjectInSheet: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em updateObjectInSheet: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em updateObjectInSheet: " + error.message);
    throw error;
  }
}
