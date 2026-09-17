/**
 * @file FileService.gs
 * @description Gerencia operações relacionadas a arquivos no Google Drive, como upload, download e listagem.
 *              Pode ser útil se a aplicação precisar lidar com anexos ou documentos.
 * @integration
 *   - Google Drive API: Interage diretamente com o Google Drive.
 *   - `Config.gs`: Pode usar IDs de pastas configuradas.
 */

function uploadFileToDrive(fileBlob, folderId) {
  // Faz o upload de um arquivo (blob) para uma pasta específica no Google Drive
  try {
    var folder = getWeekDriveFolder_(folderId);
    var file = folder.createFile(fileBlob);
    logInfo("Arquivo %s enviado com sucesso para a pasta %s.", file.getName(), folder.getName());
    return { success: true, fileId: file.getId(), fileName: file.getName() };
  } catch (e) {
    logError("Falha ao enviar arquivo: %s", e.message);
    return { success: false, message: "Falha ao enviar arquivo." };
  }
}

function getFileUrl(fileId) {
  // Retorna a URL de visualização de um arquivo no Google Drive
  try {
    var file = DriveApp.getFileById(fileId);
    return { success: true, url: file.getUrl() };
  } catch (e) {
    logError("Falha ao obter URL do arquivo %s: %s", fileId, e.message);
    return { success: false, message: "Arquivo não encontrado ou erro." };
  }
}

function listFilesInFolder(folderId) {
  try {
    // Lista todos os arquivos em uma pasta específica do Google Drive
    var folder = getWeekDriveFolder_(folderId);
    var files = folder.getFiles();
    var fileList = [];
    var max = 200;
    while (files.hasNext()) {
      var file = files.next();
      fileList.push({ id: file.getId(), name: file.getName(), url: file.getUrl() });
      if (fileList.length >= max) break;
    }
    return { success: true, files: fileList };
  } catch (error) {
    Logger.log("Erro em listFilesInFolder: " + error.message);
    throw error;
  }
}

function getWeekDriveFolder_(folderId) {
  if (folderId) return DriveApp.getFolderById(folderId);
  if (typeof getConfiguredOutputFolder === 'function') {
    try {
      return getConfiguredOutputFolder();
    } catch (ignored) {}
  }
  var props = PropertiesService.getScriptProperties();
  var outputId = props.getProperty('OUTPUT_FOLDER_ID') || props.getProperty('DRIVE_OUTPUT_FOLDER_ID');
  if (outputId) return DriveApp.getFolderById(outputId);
  throw new Error('Nenhuma pasta Drive configurada para a operação.');
}
