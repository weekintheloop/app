/**
 * @file Logger.gs
 * @description Fornece funcionalidades de logging para registrar eventos, erros e informações de depuração da aplicação.
 *              Ajuda no monitoramento e na resolução de problemas.
 * @integration
 *   - Todos os serviços (.gs) que precisam registrar informações.
 */

function logInfo(message) {
  Logger.log("[INFO] %s", message);
}

function logWarning(message) {
  Logger.log("[WARNING] %s", message);
}

function logError(message, error) {
  Logger.log("[ERROR] %s: %s", message, error ? error.message : "No error object");
}

function getLogs() {
  // Retorna os logs recentes (útil para depuração)
  return Logger.getLog();
}
