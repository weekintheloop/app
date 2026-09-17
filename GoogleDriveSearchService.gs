/**
 * @file GoogleDriveSearchService.gs
 * @description Funções para pesquisar arquivos e pastas no Google Drive usando consultas avançadas.
 *              Permite localizar documentos, imagens ou outros recursos relevantes para o projeto.
 * @integration
 *   - Google Drive API: Interage diretamente com a funcionalidade de busca do Drive.
 *   - `GoogleDriveService.gs`: Complementa as operações de arquivo e pasta.
 */

function searchFilesByName(fileName, mimeType = null) {
  // Pesquisa arquivos no Google Drive pelo nome e, opcionalmente, pelo tipo MIME.
  var query = "title contains '" + fileName + "'";
  if (mimeType) {
    query += " and mimeType = '" + mimeType + "'";
  }
  try {
    var files = DriveApp.searchFiles(query);
    var results = [];
    while (files.hasNext()) {
      var file = files.next();
      results.push({ id: file.getId(), name: file.getName(), url: file.getUrl(), mimeType: file.getMimeType() });
    }
    logInfo("Busca por arquivos com nome ", fileName, " concluída. Resultados: ", results.length);
    return { success: true, files: results };
  } catch (e) {
    logError("Falha ao buscar arquivos por nome: ", e.message);
    return { success: false, message: "Falha ao buscar arquivos." };
  }
}

function searchFoldersByName(folderName) {
  // Pesquisa pastas no Google Drive pelo nome.
  var query = "title contains '" + folderName + "' and mimeType = 'application/vnd.google-apps.folder'";
  try {
    var folders = DriveApp.searchFolders(query);
    var results = [];
    while (folders.hasNext()) {
      var folder = folders.next();
      results.push({ id: folder.getId(), name: folder.getName(), url: folder.getUrl() });
    }
    logInfo("Busca por pastas com nome ", folderName, " concluída. Resultados: ", results.length);
    return { success: true, folders: results };
  } catch (e) {
    logError("Falha ao buscar pastas por nome: ", e.message);
    return { success: false, message: "Falha ao buscar pastas." };
  }
}
