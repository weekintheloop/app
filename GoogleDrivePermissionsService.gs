/**
 * @file GoogleDrivePermissionsService.gs
 * @description Gerencia as permissões de arquivos e pastas no Google Drive de forma programática.
 *              Permite controlar quem pode visualizar, editar ou comentar em documentos e pastas do projeto.
 * @integration
 *   - Google Drive API: Interage diretamente com as permissões do Drive.
 *   - `GoogleDriveService.gs`: Complementa as operações de arquivo e pasta.
 */

function setFileViewer(fileId, email) {
  // Concede permissão de visualização a um usuário para um arquivo específico.
  try {
    DriveApp.getFileById(fileId).addViewer(email);
    logInfo("Permissão de visualização concedida a %s para o arquivo %s.", email, fileId);
    return { success: true, message: "Visualizador adicionado." };
  } catch (e) {
    logError("Falha ao adicionar visualizador ao arquivo %s: %s", fileId, e.message);
    return { success: false, message: "Falha ao adicionar visualizador." };
  }
}

function setFileEditor(fileId, email) {
  // Concede permissão de edição a um usuário para um arquivo específico.
  try {
    DriveApp.getFileById(fileId).addEditor(email);
    logInfo("Permissão de edição concedida a %s para o arquivo %s.", email, fileId);
    return { success: true, message: "Editor adicionado." };
  } catch (e) {
    logError("Falha ao adicionar editor ao arquivo %s: %s", fileId, e.message);
    return { success: false, message: "Falha ao adicionar editor." };
  }
}

function removeFilePermission(fileId, email) {
  // Remove todas as permissões de um usuário para um arquivo específico.
  try {
    var file = DriveApp.getFileById(fileId);
    var permissions = file.getAccess(email);
    if (permissions !== DriveApp.Access.NONE) {
      file.removeViewer(email);
      file.removeEditor(email);
      file.removeUser(email);
      logInfo("Permissões de %s removidas do arquivo %s.", email, fileId);
      return { success: true, message: "Permissões removidas." };
    }
    return { success: false, message: "Usuário não tinha permissões diretas no arquivo." };
  } catch (e) {
    logError("Falha ao remover permissões do arquivo %s para %s: %s", fileId, email, e.message);
    return { success: false, message: "Falha ao remover permissões." };
  }
}
