/**
 * @file LockService.gs
 * @description Gerencia bloqueios para evitar que múltiplas execuções simultâneas de funções causem conflitos de dados.
 *              Utiliza o serviço `LockService` do Google Apps Script para garantir a integridade das operações críticas.
 * @integration
 *   - `SheetService.gs`: Utiliza para proteger operações de escrita na planilha.
 *   - Funções críticas: Envolve funções que modificam dados compartilhados.
 */

function acquireLock(timeoutMilliseconds = 30000) {
  try {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(timeoutMilliseconds);
      return lock;
    } catch (e) {
      logError("Não foi possível adquirir o bloqueio: %s", e.message);
      return null;
    }
  } catch (error) {
    Logger.log("Erro em acquireLock: " + error.message);
    throw error;
  }
}

function releaseLock(lock) {
  if (lock) {
    lock.releaseLock();
  }
}

function doWithLock(callback, timeoutMilliseconds = 30000) {
  var lock = acquireLock(timeoutMilliseconds);
  if (lock) {
    try {
      return callback();
    } finally {
      releaseLock(lock);
    }
  } else {
    throw new Error("Não foi possível adquirir o bloqueio para executar a operação.");
  }
}
