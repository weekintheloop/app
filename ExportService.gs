/**
 * @file ExportService.gs
 * @description Fornece funcionalidades para exportar dados da planilha em diferentes formatos (CSV, PDF, etc.).
 *              Permite aos usuários baixar seus dados para uso externo.
 * @integration
 *   - `SheetService.gs`: Utiliza para ler os dados da planilha.
 *   - `ReportService.gs`: Pode usar dados gerados por relatórios.
 *   - `FileService.gs`: Pode usar para salvar arquivos exportados no Google Drive.
 */

function exportSheetToCsv(sheetId, sheetName) {
  try {
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    if (!sheet) {
      return { success: false, message: "Aba não encontrada." };
    }
    var data = sheet.getDataRange().getValues();
    var csvContent = data.map(function(row) { return row.join(","); }).join("\n");
    return { success: true, content: csvContent, mimeType: "text/csv" };
  } catch (error) {
    Logger.log("Erro em exportSheetToCsv: " + error.message);
    throw error;
  }
}

function exportPhysiologicalDataToCsv(userId) {
  var data = DataService.getPhysiologicalDataByUserId(userId);
  if (data.length === 0) {
    return { success: false, message: "Nenhum dado fisiológico encontrado para exportar." };
  }
  // Adicionar cabeçalhos manualmente ou de forma dinâmica
  var headers = Object.keys(data[0]);
  var csvContent = headers.join(",") + "\n";
  csvContent += data.map(function(row) {
    return headers.map(function(header) { return row[header]; }).join(",");
  }).join("\n");
  return { success: true, content: csvContent, mimeType: "text/csv", filename: "physiological_data_" + userId + ".csv" };
}
