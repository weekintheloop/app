/**
 * InputOutputFolderService.gs - Operacoes de entrada e saida em pastas Drive.
 */

function listInputFolderFiles(limit) {
  return listConfiguredFolderFiles_(getConfiguredInputFolder(), limit);
}

function listOutputFolderFiles(limit) {
  return listConfiguredFolderFiles_(getConfiguredOutputFolder(), limit);
}

function readTextFileFromInputFolder(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    return {
      ok: true,
      id: file.getId(),
      name: file.getName(),
      content: file.getBlob().getDataAsString(),
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    Logger.log("Erro em readTextFileFromInputFolder: " + error.message);
    throw error;
  }
}

function saveTextToOutputFolder(fileName, content, mimeType) {
  return createFileInConfiguredOutputFolder(fileName, content, mimeType || MimeType.PLAIN_TEXT);
}

function listConfiguredFolderFiles_(folder, limit) {
  try {
    var files = folder.getFiles();
    var rows = [];
    var max = Number(limit || 50);
    while (files.hasNext() && rows.length < max) {
      var file = files.next();
      rows.push({
        id: file.getId(),
        name: file.getName(),
        url: file.getUrl(),
        mimeType: file.getMimeType(),
        updatedAt: file.getLastUpdated()
      });
    }
    return {
      ok: true,
      folderId: folder.getId(),
      files: rows,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    Logger.log("Erro em listConfiguredFolderFiles_: " + error.message);
    throw error;
  }
}
