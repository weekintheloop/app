/**
 * @file GoogleDriveUtils.gs
 * @description Funções utilitárias para manipulação de arquivos e pastas no Google Drive, complementando o `GoogleDriveService.gs`.
 *              Inclui operações como verificar a existência de arquivos/pastas, obter metadados e gerenciar permissões.
 * @integration
 *   - `GoogleDriveService.gs`: Trabalha em conjunto para operações de Drive.
 *   - `FileService.gs`: Pode usar para operações de arquivo de baixo nível.
 */

function fileExists(fileId) {
  try {
    DriveApp.getFileById(fileId);
    return true;
  } catch (e) {
    return false;
  }
}

function folderExists(folderId) {
  try {
    DriveApp.getFolderById(folderId);
    return true;
  } catch (e) {
    return false;
  }
}

function getFileMetadata(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    return {
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      url: file.getUrl(),
      dateCreated: file.getDateCreated(),
      lastUpdated: file.getLastUpdated()
    };
  } catch (e) {
    logError("Falha ao obter metadados do arquivo ", fileId, ": ", e.message);
    return null;
  }
}

function setFilePermissions(fileId, email, permissionType) {
  // Define permissões para um arquivo (ex: VIEW, EDIT)
  try {
    var file = DriveApp.getFileById(fileId);
    file.addViewer(email); // Exemplo: adiciona como visualizador
    // file.addEditor(email); // Exemplo: adiciona como editor
    logInfo("Permissão ", permissionType, " concedida para ", email, " no arquivo ", fileId);
    return { success: true, message: "Permissão concedida." };
  } catch (e) {
    logError("Falha ao definir permissões para o arquivo ", fileId, ": ", e.message);
    return { success: false, message: "Falha ao definir permissões." };
  }
}
