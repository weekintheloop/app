/**
 * @file GoogleDriveShareService.gs
 * @description Funções para gerenciar o compartilhamento de arquivos e pastas no Google Drive.
 *              Permite compartilhar documentos, relatórios ou outros recursos com usuários específicos ou publicamente.
 * @integration
 *   - Google Drive API: Interage diretamente com as funcionalidades de compartilhamento do Drive.
 *   - `GoogleDriveService.gs`: Complementa as operações de arquivo e pasta.
 */

function shareFileWithUser(fileId, email, role = 'viewer') {
  // Compartilha um arquivo com um usuário específico, concedendo uma função (viewer, editor, commenter).
  try {
    var file = DriveApp.getFileById(fileId);
    if (role === 'viewer') {
      file.addViewer(email);
    } else if (role === 'editor') {
      file.addEditor(email);
    } else if (role === 'commenter') {
      file.addCommenter(email);
    }
    logInfo(`Arquivo ${fileId} compartilhado com ${email} como ${role}.`);
    return { success: true, message: `Arquivo compartilhado com ${email}.` };
  } catch (e) {
    logError(`Falha ao compartilhar arquivo ${fileId} com ${email}: ${e.message}`);
    return { success: false, message: `Falha ao compartilhar arquivo: ${e.message}` };
  }
}

function makeFilePublic(fileId) {
  // Torna um arquivo público para qualquer pessoa com o link.
  try {
    var file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    logInfo(`Arquivo ${fileId} tornado público.`);
    return { success: true, message: 'Arquivo tornado público.' };
  } catch (e) {
    logError(`Falha ao tornar arquivo ${fileId} público: ${e.message}`);
    return { success: false, message: `Falha ao tornar arquivo público: ${e.message}` };
  }
}

function removeFileSharing(fileId, email) {
  try {
    // Remove o compartilhamento de um arquivo com um usuário específico.
    try {
      var file = DriveApp.getFileById(fileId);
      file.removeViewer(email);
      file.removeEditor(email);
      file.removeCommenter(email);
      logInfo(`Compartilhamento do arquivo ${fileId} removido para ${email}.`);
      return { success: true, message: `Compartilhamento removido para ${email}.` };
    } catch (e) {
      logError(`Falha ao remover compartilhamento do arquivo ${fileId} para ${email}: ${e.message}`);
      return { success: false, message: `Falha ao remover compartilhamento: ${e.message}` };
    }
  } catch (error) {
    Logger.log("Erro em removeFileSharing: " + error.message);
    throw error;
  }
}
