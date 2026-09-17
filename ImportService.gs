/**
 * @file ImportService.gs
 * @description Fornece funcionalidades para importar dados para a planilha a partir de fontes externas (ex: CSV).
 *              Permite aos usuários carregar novos dados para o sistema.
 * @integration
 *   - `SheetService.gs`: Utiliza para escrever os dados na planilha.
 *   - `Validation.gs`: Pode ser usado para validar os dados importados.
 */

function importCsvToSheet(csvContent, sheetId, sheetName) {
  try {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (!sheet) {
      return { success: false, message: "Aba não encontrada." };
    }

    var csvData = Utilities.parseCsv(csvContent);
    if (csvData.length === 0) {
      return { success: false, message: "Conteúdo CSV vazio ou inválido." };
    }

    // Assume que a primeira linha do CSV são os cabeçalhos
    var headers = csvData[0];
    var dataToImport = csvData.slice(1);

    // Adiciona os dados à planilha
    sheet.getRange(sheet.getLastRow() + 1, 1, dataToImport.length, dataToImport[0].length).setValues(dataToImport);

    return { success: true, message: "Dados importados com sucesso." };
  } catch (error) {
    Logger.log("Erro em importCsvToSheet: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function importPhysiologicalDataFromCsv(csvContent) {
  return importCsvToSheet(csvContent, Config.getSpreadsheetId(), Config.getPhysiologicalDataSheetName());
}
