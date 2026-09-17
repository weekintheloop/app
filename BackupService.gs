/**
 * @file BackupService.gs
 * @description Gerencia a criação de backups dos dados da planilha Google Sheets.
 *              Pode criar cópias da planilha inteira ou de abas específicas em intervalos regulares.
 * @integration
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID da planilha principal.
 *   - `TriggerService.gs`: Pode ser usado para agendar backups automáticos.
 */

function createFullSpreadsheetBackup_() {
  try {
    var spreadsheet = SpreadsheetApp.openById(Config.getSpreadsheetId());
    var backupName = spreadsheet.getName() + "_Backup_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");

    try {
      var destinationFolder = getWeekBackupFolder_();
      var copy = spreadsheet.copy(backupName);
      DriveApp.getFileById(copy.getId()).moveTo(destinationFolder);
      logInfo("Backup completo da planilha ", backupName, " criado com sucesso.");
      return { success: true, message: "Backup criado.", fileId: copy.getId(), url: copy.getUrl() };
    } catch (e) {
      logError("Falha ao criar backup completo: ", e.message);
      return { success: false, message: "Falha ao criar backup." };
    }
  } catch (error) {
    Logger.log("Erro em createFullSpreadsheetBackup_: " + error.message);
    throw error;
  }
}

/** Lista apenas metadados de backups da pasta configurada (operação somente leitura). */
function listConfiguredBackups_() {
  var folder = getWeekBackupFolder_();
  var files = folder.getFiles();
  var backups = [];
  while (files.hasNext()) {
    var file = files.next();
    var name = String(file.getName() || '');
    if (!/_Backup_|\[BACKUP\s/i.test(name)) continue;
    var createdAt = file.getDateCreated ? file.getDateCreated() : new Date();
    var bytes = file.getSize ? Number(file.getSize()) : 0;
    backups.push({
      id: String(file.getId()),
      name: name,
      date: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
      size: Math.max(0, Math.round(bytes / 1024)),
      url: file.getUrl ? file.getUrl() : '',
      mimeType: file.getMimeType ? String(file.getMimeType() || '') : ''
    });
  }
  backups.sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });
  return backups;
}

function createSheetBackup(sheetName) {
  try {
    try {
      var spreadsheet = SpreadsheetApp.openById(Config.getSpreadsheetId());
      var sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        logWarning("Aba ", sheetName, " não encontrada para backup.");
        return { success: false, message: "Aba não encontrada." };
      }

      var backupSpreadsheet = SpreadsheetApp.create(sheetName + "_Backup_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss"));
      sheet.copyTo(backupSpreadsheet);
      backupSpreadsheet.deleteSheet(backupSpreadsheet.getSheets()[0]); // Deleta a aba padrão vazia

      try {
        var destinationFolder = getWeekBackupFolder_();
        DriveApp.getFileById(backupSpreadsheet.getId()).moveTo(destinationFolder);
        logInfo("Backup da aba ", sheetName, " criado com sucesso.");
        return { success: true, message: "Backup criado." };
      } catch (e) {
        logError("Falha ao criar backup da aba ", sheetName, ": ", e.message);
        return { success: false, message: "Falha ao criar backup." };
      }
    } catch (error) {
      Logger.log("Erro em createSheetBackup: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em createSheetBackup: " + error.message);
    throw error;
  }
}

function getWeekBackupFolder_() {
  try {
    if (typeof getConfiguredBackupFolder === 'function') {
      try {
        return getConfiguredBackupFolder();
      } catch (ignored) {}
    }
    var props = PropertiesService.getScriptProperties();
    var folderId = props.getProperty('BACKUP_FOLDER_ID') || props.getProperty('DRIVE_BACKUP_FOLDER_ID');
    if (folderId) return DriveApp.getFolderById(folderId);
    var fallbackName = 'WeekInTheLoop_Backups';
    var folders = DriveApp.getFoldersByName(fallbackName);
    return folders.hasNext() ? folders.next() : DriveApp.createFolder(fallbackName);
  } catch (error) {
    Logger.log("Erro em getWeekBackupFolder_: " + error.message);
    throw error;
  }
}
