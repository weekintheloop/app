/**
 * @file GoogleDriveService.gs
 * @description Fornece funções para interagir com o Google Drive, permitindo a manipulação de arquivos e pastas.
 *              Pode ser usado para armazenar relatórios gerados, backups ou outros documentos relacionados ao projeto.
 * @integration
 *   - `FileService.gs`: Complementa as funcionalidades de manipulação de arquivos.
 *   - `BackupService.gs`: Utiliza para armazenar backups da planilha.
 */

function createFolder(folderName, parentFolderId = null) {
  // Cria uma nova pasta no Google Drive
  try {
    var folder;
    if (parentFolderId) {
      var parentFolder = DriveApp.getFolderById(parentFolderId);
      folder = parentFolder.createFolder(folderName);
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    logInfo("Pasta ", folderName, " criada com sucesso. ID: ", folder.getId());
    return { success: true, folderId: folder.getId(), folderName: folder.getName() };
  } catch (e) {
    logError("Falha ao criar pasta ", folderName, ": ", e.message);
    return { success: false, message: "Falha ao criar pasta." };
  }
}

function getFolderById(folderId) {
  // Retorna um objeto Folder pelo ID
  try {
    var folder = DriveApp.getFolderById(folderId);
    return { success: true, folder: folder };
  } catch (e) {
    logError("Pasta com ID ", folderId, " não encontrada: ", e.message);
    return { success: false, message: "Pasta não encontrada." };
  }
}

function moveFileToFolder(fileId, destinationFolderId) {
  try {
    // Move um arquivo para uma pasta específica
    try {
      var file = DriveApp.getFileById(fileId);
      var folder = DriveApp.getFolderById(destinationFolderId);
      file.moveTo(folder);
      logInfo("Arquivo ", file.getName(), " movido para a pasta ", folder.getName());
      return { success: true, message: "Arquivo movido." };
    } catch (e) {
      logError("Falha ao mover arquivo ", fileId, ": ", e.message);
      return { success: false, message: "Falha ao mover arquivo." };
    }
  } catch (error) {
    Logger.log("Erro em moveFileToFolder: " + error.message);
    throw error;
  }
}
